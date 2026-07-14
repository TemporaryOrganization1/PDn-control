FROM ghcr.io/puppeteer/puppeteer:25.3.0

USER root
WORKDIR /app
RUN chown pptruser:pptruser /app

COPY --chown=pptruser:pptruser package.json package-lock.json* ./
USER pptruser
RUN npm ci --no-audit --no-fund

USER root
COPY --chown=pptruser:pptruser . .
USER pptruser

ENV XDG_CONFIG_HOME=/tmp/chromium-config
ENV XDG_CACHE_HOME=/tmp/chromium-cache

EXPOSE 3000

CMD ["npm", "start"]
