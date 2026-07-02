# Production Dockerfile for Yandex Cloud Serverless Container
# This Dockerfile is optimized for production deployment

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV OUTPUT_MODE="export"
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]