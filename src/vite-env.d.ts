/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  /**
   * Optional OSC login URL. When set at build time (e.g.
   * `AUTH=https://app.osaas.io/?redirect=/dashboard/service/eyevinn-intercom-manager`),
   * the app redirects here whenever the manager returns HTTP 401.
   */
  readonly AUTH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
