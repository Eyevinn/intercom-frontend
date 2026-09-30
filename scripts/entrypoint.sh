#!/bin/bash

LISTENPORT="${PORT:-3000}"

# Validate LISTENPORT is a plain integer in the valid TCP port range (1-65535)
# before using it in the sed command below. An unvalidated value containing a
# forward slash (e.g. "3000/tcp") would break the sed expression ("unterminated
# substitution") and crash-loop the container. Fail fast with a clear message.
# Reject empty, non-digit, or overflow-length (>5 digits) values here so that
# the numeric range test below only ever sees a safe 1-5 digit integer (a longer
# all-digit value would otherwise error out of the range test and fall through).
case "$LISTENPORT" in
  ''|*[!0-9]*|??????*)
    echo "entrypoint.sh: invalid PORT '$LISTENPORT': must be an integer between 1 and 65535" >&2
    exit 1
    ;;
esac
if [ "$LISTENPORT" -lt 1 ] || [ "$LISTENPORT" -gt 65535 ]; then
  echo "entrypoint.sh: invalid PORT '$LISTENPORT': must be an integer between 1 and 65535" >&2
  exit 1
fi

sed -i "s/listen\s*8080;/listen $LISTENPORT;/" /etc/nginx/conf.d/default.conf
API_URL="${MANAGER_URL:-/}"

if [ ! -z "$OSC_HOSTNAME" ]; then
  API_URL="https://$OSC_HOSTNAME/"
fi

echo "VITE_BACKEND_URL=$API_URL"

VITE_BACKEND_URL=$API_URL AUTH=$AUTH npm run build && \
  cp -r /app/dist/* /usr/share/nginx/html/ && \
  nginx -g 'daemon off;'
