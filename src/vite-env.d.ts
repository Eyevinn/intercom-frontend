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
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
