# syntax=docker/dockerfile:1

# --- Build stage: compile the documentation/demo site ---------------------
FROM node:24-alpine AS build
WORKDIR /app

# Install deps against the lockfile for reproducible builds.
COPY package.json package-lock.json ./
RUN npm ci

# Build the static site (runs gen:docs then `vite build --mode demo`).
COPY . .
RUN npm run build:demo

# --- Runtime stage: serve the static files with nginx ---------------------
FROM nginx:1.27-alpine AS runtime

# Static assets produced by the build stage.
COPY --from=build /app/dist-demo /usr/share/nginx/html
# Custom server config (UTF-8, SPA-style fallback, sane caching).
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Lightweight healthcheck so Portainer/Watchtower see the container state.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

EXPOSE 80
