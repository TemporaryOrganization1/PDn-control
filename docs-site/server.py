#!/usr/bin/env python3
"""Small documentation viewer for the repository docs/ folder."""

from __future__ import annotations

import argparse
import json
import mimetypes
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from typing import Dict, List, Optional
from urllib.parse import parse_qs, unquote, urlparse


ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs"
STATIC_DIR = Path(__file__).resolve().parent / "static"

TEXT_EXTENSIONS = {".md", ".mmd", ".txt", ".yaml", ".yml", ".json"}


def safe_join(base: Path, relative: str) -> Optional[Path]:
    candidate = (base / relative).resolve()
    try:
        candidate.relative_to(base.resolve())
    except ValueError:
        return None
    return candidate


def docs_tree() -> List[Dict[str, str]]:
    files: List[Dict[str, str]] = []
    for path in sorted(DOCS_DIR.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in TEXT_EXTENSIONS:
            continue
        relative = path.relative_to(DOCS_DIR).as_posix()
        title = path.stem.replace("-", " ").replace("_", " ").title()
        if path.name.lower() == "readme.md":
            title = path.parent.name.replace("-", " ").replace("_", " ").title() or "Docs"
        files.append({"path": relative, "title": title, "extension": path.suffix.lower()})
    return files


class DocsHandler(BaseHTTPRequestHandler):
    server_version = "PDnDocs/1.0"

    def log_message(self, format: str, *args: object) -> None:
        print("%s - %s" % (self.address_string(), format % args))

    def send_bytes(self, status: int, body: bytes, content_type: str) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def send_text(self, status: int, text: str, content_type: str = "text/plain; charset=utf-8") -> None:
        self.send_bytes(status, text.encode("utf-8"), content_type)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = unquote(parsed.path)

        if path == "/api/tree":
            self.send_text(200, json.dumps(docs_tree()), "application/json; charset=utf-8")
            return

        if path == "/api/document":
            query = parse_qs(parsed.query)
            requested = query.get("path", [""])[0]
            document = safe_join(DOCS_DIR, requested)
            if document is None or not document.is_file() or document.suffix.lower() not in TEXT_EXTENSIONS:
                self.send_text(404, "Document not found")
                return
            payload = {
                "path": requested,
                "title": document.name,
                "content": document.read_text(encoding="utf-8"),
                "extension": document.suffix.lower(),
            }
            self.send_text(200, json.dumps(payload), "application/json; charset=utf-8")
            return

        if path.startswith("/docs/"):
            requested = path[len("/docs/") :]
            document = safe_join(DOCS_DIR, requested)
            if document is None or not document.is_file():
                self.send_text(404, "Document not found")
                return
            content_type = mimetypes.guess_type(document.name)[0] or "text/plain"
            if document.suffix.lower() in TEXT_EXTENSIONS:
                content_type = "text/plain; charset=utf-8"
            self.send_bytes(200, document.read_bytes(), content_type)
            return

        static_path = "index.html" if path in {"/", ""} else path.lstrip("/")
        static_file = safe_join(STATIC_DIR, static_path)
        if static_file is None or not static_file.is_file():
            self.send_text(404, "Not found")
            return
        content_type = mimetypes.guess_type(static_file.name)[0] or "application/octet-stream"
        if static_file.suffix.lower() in {".html", ".css", ".js"}:
            content_type += "; charset=utf-8"
        self.send_bytes(200, static_file.read_bytes(), content_type)


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve the PDn-control docs/ folder as a small website.")
    parser.add_argument("--host", default="127.0.0.1", help="Host interface to bind. Use 0.0.0.0 on a server.")
    parser.add_argument("--port", type=int, default=8088, help="Port to listen on.")
    args = parser.parse_args()

    if not DOCS_DIR.exists():
        raise SystemExit(f"docs directory not found: {DOCS_DIR}")

    server = ThreadingHTTPServer((args.host, args.port), DocsHandler)
    print(f"Serving documentation from {DOCS_DIR}")
    print(f"Open http://{args.host}:{args.port}/")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping documentation server")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
