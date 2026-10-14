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
   * Optional WebRTC ICE servers as a JSON array of `RTCIceServer` objects (e.g.
   * `VITE_ICE_SERVERS=[{"urls":"stun:stun.l.google.com:19302"}]`). When unset or
   * invalid, the app falls back to the default Google STUN servers.
   */
  readonly VITE_ICE_SERVERS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
