# QA Engineer — Agent Notes

## Friction Points

1. **Vite HMR cache corruption**: After dark mode toggle triggered a stale module error (CheckIcon), the browser tab became permanently broken. Required opening a fresh tab. Dev server restart was suggested but ultimately unnecessary — the file existed, it was a Vite module cache issue.

2. **root.css @import breaks Vite**: Adding `@import url(...)` for Google Fonts in root.css caused Vite's CSS compiler to return HTTP 500, breaking the entire app. External font loading must use `<link>` tags in HTML, not CSS @import in Vite projects.

3. **SPA navigation quirks**: Direct URL navigation to `/home/members` or `/home/settings` sometimes renders the feed page instead. Client-side routing via clicking nav links works correctly. This is a One framework SPA mode behavior.

4. **Chrome extension interference**: The `mcp__claude-in-chrome__javascript_tool` was intermittently blocked by a browser extension filter when queries contained certain strings (e.g., "fonts.googleapis", "cookie"). Simplified queries worked around this.

5. **Toggle theme button off-screen**: The "Toggle theme" button was positioned at y=616, outside the 598px viewport. Had to use `scrollIntoView()` + JS click to reach it. The button is in a settings sidebar that's only partially visible.

## What Went Well

- State color implementation is clean — 4px left border + subtle bg tint is visually effective
- Member accent colors (blue/orange rings) are distinct and visible in both light and dark mode
- Dark mode warm palette (rgb(44,40,37)) feels appropriate for a household app
- All buttons consistently 8px rounded
- Inter font properly set as sole typeface (no Playfair Display remnants)

## Recommendations for Future QA

- Set up a proper Playwright test suite that can programmatically test dark mode toggle, completion animation timing, and press feedback
- Consider adding visual regression testing (Percy, Chromatic) for theme changes
- Native testing (iOS simulator) should be a separate QA pass with its own checklist
