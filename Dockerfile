FROM node:21-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# RUN apk add --no-cache libc6-compat g++ cmake tar make
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN yarn --immutable

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set backed url to empty string to use window.location.origin fallback
RUN VITE_BACKEND_URL="" yarn build

# Production image, copy all the files and run next
FROM nginx:1.19.0 AS runner
WORKDIR /usr/share/nginx/html/app
RUN rm -rf ./*

ENV NODE_ENV production

COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist .

ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
