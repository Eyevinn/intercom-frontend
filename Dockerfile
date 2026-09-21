FROM nginx:1.29.0
ARG PORT=8080
ARG MANAGER_URL
EXPOSE $PORT
EXPOSE $MANAGER_URL

RUN apt-get update
RUN apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
RUN apt-get install -y nodejs
RUN mkdir /app
WORKDIR /app

COPY . .
RUN npm ci

COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
RUN chmod +x /app/scripts/entrypoint.sh

# Run nginx as the unprivileged "nginx" user (uid 101) that ships with the
# official image. Give that user ownership of every path written at runtime:
# - /app                      : `npm run build` writes /app/dist
# - /usr/share/nginx/html     : entrypoint copies the built assets here
# - /etc/nginx/conf.d         : entrypoint runs `sed -i` on default.conf
# - /var/cache/nginx          : nginx client/proxy/fastcgi temp paths
# - /var/log/nginx            : nginx access/error logs
# - /var/run, /run            : nginx pid file (default /var/run/nginx.pid)
RUN chown -R nginx:nginx \
      /app \
      /usr/share/nginx/html \
      /etc/nginx/conf.d \
      /var/cache/nginx \
      /var/log/nginx \
      /var/run \
      /run

ENV NODE_ENV production
USER nginx
ENTRYPOINT [ "/app/scripts/entrypoint.sh" ]
