/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CUSTOMER_URL?: string;
  readonly VITE_DRIVER_URL?: string;
  readonly VITE_ADMIN_URL?: string;
  readonly VITE_VIEWER_URL?: string;
  readonly VITE_GITHUB_PAGES?: string;
  readonly VITE_APP_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
