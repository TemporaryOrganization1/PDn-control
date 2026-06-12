FROM node:20-slim

RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libxshmfence1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

RUN npm config set registry https://registry.npmmirror.com && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 60000

COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund --loglevel verbose

COPY . .

EXPOSE 3000

CMD ["npx", "tsx", "src/server.ts"]