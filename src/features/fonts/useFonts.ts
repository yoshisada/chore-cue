/**
 * Web font loading stub.
 * On web, fonts are loaded via CSS @import in root.css.
 * This hook simply returns true so components can render immediately.
 */
export function useLuxuryFonts() {
  return { fontsLoaded: true }
}
