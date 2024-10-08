/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FAL_AI_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}