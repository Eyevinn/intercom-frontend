# Keycloak / OIDC login

The app can require a Keycloak login before it renders. It is **off by default** —
without `VITE_OIDC_ENABLED` nothing changes and the existing static
`VITE_BACKEND_API_KEY` keeps being sent as before.

## Configuration

Vite inlines these at **build** time, and this image runs `npm run build` in its
entrypoint, so they are set as container environment variables (see
`scripts/entrypoint.sh`), not baked into the image.

| Variable                 | Required     | Meaning                                                                    |
| ------------------------ | ------------ | -------------------------------------------------------------------------- |
| `VITE_OIDC_ENABLED`      | –            | `true`/`1`/`yes`/`on` turns the login flow on. Default off.                 |
| `VITE_OIDC_AUTHORITY`    | when enabled | Realm issuer, e.g. `https://keycloak.run.dmf.qvest-digital.com/realms/dmf` |
| `VITE_OIDC_CLIENT_ID`    | when enabled | Public client id registered in the realm.                                  |
| `VITE_OIDC_REDIRECT_URI` | –            | Defaults to the browser origin. Must match a client redirect URI.          |
| `VITE_OIDC_SCOPE`        | –            | Defaults to `openid profile email`.                                        |

If the flag is on but the authority or client id is missing, the app logs an
error and continues **with OIDC disabled** rather than rendering a page nobody
can log into.

## How it fits together

- `src/auth/oidc-settings.ts` — reads the env, builds the `UserManager`
  (authorization code + PKCE, silent renew, session in `localStorage`).
- `src/auth/auth-provider.tsx` — wraps the app in `react-oidc-context`, and
  keeps the API layer's token getter pointed at the current access token so a
  silently renewed token is picked up without a reload.
- `src/auth/require-auth.tsx` — blocks the app until a session exists, then
  redirects to Keycloak once (a guard prevents a redirect loop when the callback
  comes back unauthenticated).
- `src/auth/access-token.ts` — `authHeaders()`, used by all 20 request helpers in
  `src/api/api.ts`. Prefers the OIDC access token, falls back to
  `VITE_BACKEND_API_KEY`.
- `src/auth/user-menu.tsx` — shows the signed-in username and a sign-out button
  in the header. Renders nothing when OIDC is disabled.

Keycloak always redirects back to `redirect_uri` (the app root), so the location
the user started from is round-tripped through the OIDC `state` and restored
afterwards — share links carry their target in the path and query string.
`readReturnTo` only accepts a relative path, so a tampered `state` cannot
redirect off-site.

## Realm client

Not yet created. It must be a **public** client with PKCE — a browser app cannot
hold a client secret. See `docs/oidc.md` in `intercom-manager` for the
`KeycloakRealmImport` snippet, including the audience mapper needed if the
manager is run with `OIDC_AUDIENCE`.

Redirect URIs must cover every origin the app is served from, including
`http://localhost:5173` for local development.

## What is not covered yet

- **WHIP/WHEP URLs** (`src/utils/generateWhipUrl.ts`,
  `generateWhepUrl.ts`) still use their own key. Those URLs are handed to
  external tools that have no Keycloak session, and the manager keeps those
  routes on `WHIP_AUTH_KEY`.
- **Websocket connections** (`src/hooks/use-websocket.ts`) do not send a token.
  Browsers cannot set headers on a websocket handshake, so this needs either a
  ticket endpoint or a subprotocol token — decide before turning enforcement on
  for a deployment that relies on them.
- **Roles are not used for authorization** in the UI yet. The manager can require
  one globally via `OIDC_REQUIRED_ROLE`, but the frontend does not hide admin
  actions (create/manage productions) from users lacking a role.
