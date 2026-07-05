const state = {
  docs: [],
  currentPath: "",
};

const nav = document.querySelector("#nav");
const search = document.querySelector("#search");
const title = document.querySelector("#title");
const pathLabel = document.querySelector("#path");
const rawLink = document.querySelector("#raw-link");
const documentNode = document.querySelector("#document");
const menu = document.querySelector("#menu");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function resolveDocHref(href) {
  if (href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) {
    return href;
  }
  const [hrefPath, anchor = ""] = href.split("#");
  const currentParts = state.currentPath.split("/");
  currentParts.pop();
  const parts = hrefPath.startsWith("/")
    ? hrefPath.replace(/^\/+/, "").split("/")
    : [...currentParts, ...hrefPath.split("/")];
  const normalized = [];
  parts.forEach((part) => {
    if (!part || part === ".") {
      return;
    }
    if (part === "..") {
      normalized.pop();
      return;
    }
    normalized.push(part);
  });
  const path = normalized.join("/");
  return `/docs/${path}${anchor ? `#${anchor}` : ""}`;
}

function inlineMarkdown(value) {
  let output = escapeHtml(value);
  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
    const safeHref = resolveDocHref(href);
    return `<a href="${escapeHtml(safeHref)}">${label}</a>`;
  });
  return output;
}

function renderTable(lines, start) {
  const rows = [];
  let index = start;
  while (index < lines.length && /^\s*\|.*\|\s*$/.test(lines[index])) {
    rows.push(lines[index]);
    index += 1;
  }
  if (rows.length < 2 || !/^\s*\|?\s*:?-{3,}:?\s*\|/.test(rows[1])) {
    return null;
  }
  const htmlRows = rows
    .filter((_row, rowIndex) => rowIndex !== 1)
    .map((row, rowIndex) => {
      const cells = row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|");
      const tag = rowIndex === 0 ? "th" : "td";
      return `<tr>${cells.map((cell) => `<${tag}>${inlineMarkdown(cell.trim())}</${tag}>`).join("")}</tr>`;
    })
    .join("");
  return { html: `<table>${htmlRows}</table>`, next: index };
}

function renderMarkdown(markdown) {
  const codeBlocks = [];
  let prepared = markdown.replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, lang = "", code) => {
    const token = `@@CODEBLOCK_${codeBlocks.length}@@`;
    codeBlocks.push({ lang: lang.toLowerCase(), code });
    return token;
  });

  const lines = prepared.split(/\r?\n/);
  const html = [];
  let index = 0;
  let listOpen = false;

  const closeList = () => {
    if (listOpen) {
      html.push("</ul>");
      listOpen = false;
    }
  };

  while (index < lines.length) {
    const line = lines[index];
    const codeToken = line.match(/^@@CODEBLOCK_(\d+)@@$/);
    if (codeToken) {
      closeList();
      const block = codeBlocks[Number(codeToken[1])];
      if (block.lang === "mermaid") {
        html.push(`<div class="mermaid">${escapeHtml(block.code)}</div>`);
      } else {
        html.push(`<pre><code>${escapeHtml(block.code)}</code></pre>`);
      }
      index += 1;
      continue;
    }

    const table = renderTable(lines, index);
    if (table) {
      closeList();
      html.push(table.html);
      index = table.next;
      continue;
    }

    if (/^\s*$/.test(line)) {
      closeList();
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    const listItem = line.match(/^\s*[-*]\s+(.+)$/);
    if (listItem) {
      if (!listOpen) {
        html.push("<ul>");
        listOpen = true;
      }
      html.push(`<li>${inlineMarkdown(listItem[1])}</li>`);
      index += 1;
      continue;
    }

    const quote = line.match(/^>\s?(.+)$/);
    if (quote) {
      closeList();
      html.push(`<blockquote>${inlineMarkdown(quote[1])}</blockquote>`);
      index += 1;
      continue;
    }

    closeList();
    html.push(`<p>${inlineMarkdown(line)}</p>`);
    index += 1;
  }

  closeList();
  return html.join("\n");
}

function renderMermaidDocument(source) {
  return [
    `<div class="mermaid">${escapeHtml(source)}</div>`,
    "<h2>Source</h2>",
    `<pre><code>${escapeHtml(source)}</code></pre>`,
  ].join("\n");
}

function renderNav() {
  const query = search.value.trim().toLowerCase();
  nav.innerHTML = "";
  state.docs
    .filter((doc) => !query || doc.path.toLowerCase().includes(query) || doc.title.toLowerCase().includes(query))
    .forEach((doc) => {
      const link = document.createElement("a");
      link.href = `#${doc.path}`;
      link.className = `nav-link${doc.path === state.currentPath ? " active" : ""}`;
      link.innerHTML = `<span>${escapeHtml(doc.title)}</span><small>${escapeHtml(doc.path)}</small>`;
      nav.appendChild(link);
    });
}

async function loadDocument(path) {
  state.currentPath = path;
  renderNav();
  document.body.classList.remove("nav-open");
  const response = await fetch(`/api/document?path=${encodeURIComponent(path)}`);
  if (!response.ok) {
    documentNode.innerHTML = "<p>Document not found.</p>";
    return;
  }
  const doc = await response.json();
  title.textContent = doc.title;
  pathLabel.textContent = `docs/${doc.path}`;
  rawLink.href = `/docs/${doc.path}`;
  documentNode.innerHTML = doc.extension === ".mmd"
    ? renderMermaidDocument(doc.content)
    : renderMarkdown(doc.content);
  if (window.mermaid) {
    window.mermaid.initialize({ startOnLoad: false, theme: "default" });
    window.mermaid.run({ nodes: documentNode.querySelectorAll(".mermaid") });
  }
}

function chooseInitialDocument() {
  const hashPath = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  if (hashPath && state.docs.some((doc) => doc.path === hashPath)) {
    return hashPath;
  }
  return state.docs.find((doc) => doc.path === "architecture/README.md")?.path || state.docs[0]?.path;
}

async function init() {
  const response = await fetch("/api/tree");
  state.docs = await response.json();
  renderNav();
  const firstDocument = chooseInitialDocument();
  if (firstDocument) {
    await loadDocument(firstDocument);
  }
}

window.addEventListener("hashchange", () => {
  const nextPath = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  if (nextPath) {
    loadDocument(nextPath);
  }
});

search.addEventListener("input", renderNav);
menu.addEventListener("click", () => document.body.classList.toggle("nav-open"));
documentNode.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) {
    return;
  }
  const url = new URL(link.href);
  if (url.origin === window.location.origin && url.pathname.startsWith("/docs/")) {
    const docPath = decodeURIComponent(url.pathname.replace(/^\/docs\//, ""));
    if (state.docs.some((doc) => doc.path === docPath)) {
      event.preventDefault();
      window.location.hash = docPath;
    }
  }
});

init().catch((error) => {
  documentNode.innerHTML = `<p>Documentation failed to load: ${escapeHtml(error.message)}</p>`;
});
