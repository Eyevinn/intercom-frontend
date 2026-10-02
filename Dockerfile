# syntax=docker/dockerfile:1

# ---- Stage 1: builder ----
# Build the Vite/React static bundle with an official, pinned Node.js image.
# This replaces the previous curl-pipe-bash nodesource install and keeps
# Node.js out of the runtime image entirely. The current Dockerfile installs
# Node via `setup_22.x`, so the official node:22 image is the matching major.
FROM node:22-alpine AS builder

# Build-time configuration baked into the static bundle by Vite.
# MANAGER_URL maps to VITE_BACKEND_URL (matching the previous entrypoint
# default of "/"); AUTH is exposed to the client via vite.config.ts.
ARG MANAGER_URL=/
ARG AUTH

WORKDIR /app

# Install dependencies first to leverage Docker layer caching.
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source and build the static assets into /app/dist.
COPY . .
RUN VITE_BACKEND_URL="${MANAGER_URL}" AUTH="${AUTH}" npm run build

# ---- Stage 2: runtime ----
# Serve the pre-built static assets with nginx. No Node.js/npm/curl here.
FROM nginx:1.29.0

ARG PORT=8080
EXPOSE $PORT

# nginx site configuration. The listen port is templated at container start
# by the entrypoint (see scripts/entrypoint.sh).
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Runtime entrypoint: validates PORT, sets the nginx listen port, starts nginx.
COPY ./scripts/entrypoint.sh /app/scripts/entrypoint.sh
RUN chmod +x /app/scripts/entrypoint.sh

# Copy ONLY the built static assets from the builder stage.
COPY --from=builder /app/dist/ /usr/share/nginx/html/

# Run nginx as the unprivileged "nginx" user (uid 101) that ships with the
# official image. Give that user ownership of every path written at runtime:
# - /usr/share/nginx/html     : static assets served by nginx
# - /etc/nginx/conf.d         : entrypoint runs `sed -i` on default.conf
# - /var/cache/nginx          : nginx client/proxy/fastcgi temp paths
# - /var/log/nginx            : nginx access/error logs
# - /var/run, /run            : nginx pid file (default /var/run/nginx.pid)
RUN chown -R nginx:nginx \
      /usr/share/nginx/html \
      /etc/nginx/conf.d \
      /var/cache/nginx \
      /var/log/nginx \
      /var/run \
      /run

ENV NODE_ENV production
USER nginx
ENTRYPOINT [ "/app/scripts/entrypoint.sh" ]
