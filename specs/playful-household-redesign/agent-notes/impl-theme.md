# impl-theme Friction Notes

## Animation preset rename required updating component files

Tasks T006/T007 renamed the animation presets (luxurySlow -> playfulBounce, etc.) but the task split assigned component files to impl-components. Since removing old presets without updating references would break the app at runtime, I updated all `luxurySlow` references in Button.tsx, Pressable.tsx, Input.tsx, ThemeSwitch.tsx, Toast.tsx, and ScrollHeader.tsx as part of Phase 2. impl-components should be aware these files already have the `playfulQuick` transition set.

## Playfair Display reference in root.css

The `app/root.css` file had a `--font-heading` CSS variable still pointing to Playfair Display. This was not listed in any task but was caught during T011 grep verification. Updated to Inter.

## Google Fonts CSS link in _layout.tsx

The `<link>` tag in `app/_layout.tsx` was loading Playfair Display from Google Fonts CDN. Removed the Playfair Display family from the URL.

## Pre-existing test failures

5 unit tests (3 in useHouseholdContext.test.ts, 2 in ChoreHomePage.create.test.tsx) were already failing before any theme changes. These are related to household context changes on the branch, not theme work. The baseline is 126 passing / 5 failing.

## T013 CSS regeneration

The tamagui.generated.css file will be regenerated when `bun dev` runs. No old theme references were found in the existing CSS. This regeneration happens automatically when the dev server starts.
