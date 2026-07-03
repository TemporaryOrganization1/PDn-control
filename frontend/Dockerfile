# Production Dockerfile for Yandex Cloud Serverless Container
# This Dockerfile is optimized for production deployment

FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies

# Install dependencies
COPY package*.json ./
RUN npm ci
COPY . .

# Build the application with static export
ENV OUTPUT_MODE=export
RUN npm run build

# Production stage - serve static files with nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=builder /app/out /usr/share/nginx/html

ARG NGINX_CONFIG=nginx.conf
COPY ${NGINX_CONFIG} /etc/nginx/conf.d/default.conf

EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
