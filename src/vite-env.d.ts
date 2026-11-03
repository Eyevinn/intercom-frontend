/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  /**
   * Optional OSC login URL. When set at build time (e.g.
   * `AUTH=https://app.osaas.io/?redirect=/dashboard/service/eyevinn-intercom-manager`),
   * the app redirects here whenever the manager returns HTTP 401.
   */
  readonly AUTH?: string;

  /**
   * Optional JSON array of RTCIceServer objects used for the WebRTC peer
   * connections, e.g. `[{"urls":"stun:stun.example.com:3478"}]`. When unset the
   * app falls back to Google's public STUN servers. See
   * src/utils/runtime-config.ts (getIceServers).
   */
  readonly VITE_ICE_SERVERS?: string;

  /**
   * Optional flag mirroring the manager's REQUIRE_AUTH setting. When `"true"`
   * (or `"1"`) the role route guards require a role to be requested before
   * restricted routes open. Unset/anything else keeps the Roles feature
   * dormant. See src/utils/runtime-config.ts (getRequireAuth).
   */
  readonly VITE_REQUIRE_AUTH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
