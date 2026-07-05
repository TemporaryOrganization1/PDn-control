FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

ENV OUTPUT_MODE=export
RUN npm run build

FROM nginx:alpine

RUN rm -rf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/out /usr/share/nginx/html

ARG NGINX_CONFIG=nginx.conf

COPY ${NGINX_CONFIG} /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.d/40-generate-pdn-nginx.sh /docker-entrypoint.d/40-generate-pdn-nginx.sh
RUN sed -i 's/\r$//' /docker-entrypoint.d/40-generate-pdn-nginx.sh \
    && chmod +x /docker-entrypoint.d/40-generate-pdn-nginx.sh

EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
