/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_FACEBOOK_APP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

interface Window {
  google?: { accounts?: { id: { initialize: (config: { client_id: string; callback: (response: { credential?: string }) => void }) => void; prompt: () => void } } };
  FB?: { init: (config: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void; login: (callback: (response: { authResponse?: { accessToken?: string } }) => void, options: { scope: string }) => void };
}
