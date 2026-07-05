# PDn-control Documentation Site

This folder contains a small self-hosted documentation viewer for the maintained files in `docs/`.
It is intended for a weak or separate server where only the project documentation needs to be available.

## Run Locally

From the repository root:

```bash
python docs-site/server.py --host 127.0.0.1 --port 8088
```

Open [http://127.0.0.1:8088/](http://127.0.0.1:8088/).

## Run On A Server

```bash
git clone https://github.com/TemporaryOrganization1/PDn-control.git
cd PDn-control
python3 docs-site/server.py --host 0.0.0.0 --port 8088
```

Then point a reverse proxy or firewall rule to port `8088`.
The documentation viewer does not start the product frontend, backend, workers, PostgreSQL, or Docker Compose stack.

## Scope

- Serves all readable Markdown and diagram source files from `docs/`.
- Provides a searchable navigation sidebar
- Renders Markdown in the browser
- Renders Mermaid diagrams
