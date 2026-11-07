/// <reference types="vite/client" />

interface GTranslateSettings {
  default_language: string
  alt_flags: Record<string, string>
  wrapper_selector: string
  flag_style: string
}

declare global {
  interface Window {
    gtranslateSettings?: GTranslateSettings
  }
}
