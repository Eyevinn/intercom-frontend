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

# The static bundle is produced at image build time (multi-stage build) and
# already copied into /usr/share/nginx/html, so no Node.js build step runs here.
#
# Per-deployment configuration is injected at runtime instead of being baked
# into the bundle: generate /usr/share/nginx/html/env.js defining window.__ENV__
# from the container's environment. The app reads this first and falls back to
# build-time env vars / window.location.origin (see src/utils/runtime-config.ts).
# This keeps Node/npm/curl out of the runtime image while restoring the old
# ability to point one shared image at a different backend per deployment.
API_URL="${MANAGER_URL:-/}"
if [ -n "$OSC_HOSTNAME" ]; then
  API_URL="https://$OSC_HOSTNAME/"
fi

# Escape backslashes and double quotes so values embed safely in a JS string.
escape_js() {
  printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}

echo "entrypoint.sh: configuring runtime env.js (MANAGER_URL=$API_URL)"

cat > /usr/share/nginx/html/env.js <<EOF
window.__ENV__ = {
  MANAGER_URL: "$(escape_js "$API_URL")",
  AUTH: "$(escape_js "${AUTH:-}")"
};
EOF

exec nginx -g 'daemon off;'
