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
   * Optional JSON array string of `RTCIceServer` entries used for the WebRTC
   * peer connection (e.g. `[{"urls":"stun:stun.example.com:3478"}]`). When
   * unset or not valid JSON, the app falls back to the Google STUN defaults.
   */
  readonly VITE_ICE_SERVERS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
