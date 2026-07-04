# Production Dockerfile for Yandex Cloud Serverless Container
# This Dockerfile is optimized for production deployment

FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm i
COPY . .

# Build the application with static export
ENV OUTPUT_MODE=export
RUN npm run build

# Production stage - serve static files with nginx
FROM nginx:alpine

# Remove default nginx config directory
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=builder /app/out /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]