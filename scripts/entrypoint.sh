#!/bin/bash

LISTENPORT="${PORT:-3000}"
sed -i "s/listen\s*8080;/listen $LISTENPORT;/" /etc/nginx/conf.d/default.conf
API_URL="${MANAGER_URL:-/}"

if [ ! -z "$OSC_HOSTNAME" ]; then
  API_URL="https://$OSC_HOSTNAME/"
fi

echo "VITE_BACKEND_URL=$API_URL"

VITE_BACKEND_URL=$API_URL yarn build && \
  cp -r /app/dist/* /usr/share/nginx/html/ && \
  nginx -g 'daemon off;'
