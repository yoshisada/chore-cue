# Research: Luxury Editorial Redesign

## Decision 1: Use Tamagui's theme system with custom color palettes for the luxury editorial palette

**Decision**: Define the luxury editorial palette (warm alabaster, charcoal, pale taupe, warm grey, metallic gold) as custom Tamagui theme objects that map to the standard `color1`-`color12` scale, `background`, `color`, `borderColor`, and `shadowColor` semantic tokens.

**Rationale**: Tamagui's theme system already supports numbered color scales and semantic mappings. The default v5 config provides the structural foundation. Creating custom light and dark theme objects that override the default palette values is the idiomatic approach — it integrates with all existing Tamagui components, styled variants, and the `<Theme>` component without patching or forking the default config.

**Alternatives considered**:

- Overriding individual token values globally: rejected because tokens are static and do not support dark mode switching. Themes are the correct layer for dynamic color changes.
- Using CSS custom properties outside Tamagui: rejected because it bypasses the styling system and creates inconsistency between web and native rendering.

## Decision 2: Load Playfair Display and Inter via expo-google-fonts on native and Google Fonts CDN on web

**Decision**: Install `@expo-google-fonts/inter` and `@expo-google-fonts/playfair-display` for native font loading via `useFonts()` hook. On web, load fonts via a Google Fonts CSS `@import` in `root.css`. Register both as Tamagui font families in `fonts.ts` using `createSystemFont`.

**Rationale**: The project already has `expo-font` installed (v14.0.9) and the infrastructure for font loading is prepared but inactive (commented-out plugin config in `app.config.ts`). The expo-google-fonts packages provide pre-built TTF files that integrate with Expo's asset pipeline. On web, Google Fonts CDN is the standard approach and avoids bundling font files. Tamagui's `createSystemFont` accepts per-weight family mappings, which naturally maps to the separate font files that expo-google-fonts exports.

**Alternatives considered**:

- Self-hosting font files for both web and native: rejected because it increases bundle size and complexity without meaningful benefit. Google Fonts CDN is faster for web users.
- Using system serif (Georgia) instead of Playfair Display: rejected because the luxury editorial aesthetic depends on the high-contrast stroke characteristic that system serifs do not reliably provide.
- Loading fonts via `@font-face` in CSS for both platforms: rejected because React Native does not support CSS font loading — expo-font is required.

## Decision 3: Implement the gold sliding button animation with platform-specific files

**Decision**: Create the primary button's gold sliding reveal animation using a web-specific implementation (CSS transitions with absolute-positioned overlay) and a native-specific implementation (Reanimated `withTiming` with `Animated.View` overlay), following the existing `.native.tsx` file convention.

**Rationale**: The codebase already uses this platform split pattern extensively (Toast.native.tsx, animationsRoot.native.ts, setupStorage.native.ts). CSS transitions handle the gold slide naturally on web. On native, Reanimated provides GPU-accelerated transforms that achieve the same effect. Attempting a single cross-platform implementation would require compromises that degrade the animation quality on one or both platforms.

**Alternatives considered**:

- Using Tamagui's built-in `hoverStyle` with `transition` prop for both platforms: rejected because the gold sliding overlay requires an absolute-positioned child element with independent transform animation, which Tamagui's declarative style props cannot express.
- Using Moti (a Reanimated-based animation library) for both platforms: rejected because the project does not use Moti and adding it creates unnecessary dependency churn when Reanimated is already available.
- Skipping the gold slide animation and using a simple color transition: rejected because the gold sliding reveal is a signature "bold factor" element specified in the design system.

## Decision 4: Enforce zero border radius through Tamagui styled component defaults and token overrides

**Decision**: Set the Tamagui `radius` token scale values to 0 for the commonly used tiers (`$2`, `$3`, `$4`) and update the shared interface components (`Button`, `Input`, `Card`, `Dialog`, `Avatar`) to use `borderRadius: 0`. This ensures all components render with sharp rectangular edges by default.

**Rationale**: Tamagui components reference radius tokens from the configuration. Overriding the token values catches most usage. Updating the interface wrapper components catches any that use hardcoded values. This two-layer approach — tokens plus component defaults — provides comprehensive coverage without requiring changes to every feature file that renders a component.

**Alternatives considered**:

- Only overriding tokens without updating components: rejected because some components use hardcoded radius values that bypass tokens.
- Using a global CSS override (`* { border-radius: 0 !important }`): rejected because it only applies on web and conflicts with Tamagui's style system.
- Leaving radius tokens unchanged and only updating individual components: rejected because new components or third-party integrations would inherit non-zero radius from the default config.

## Decision 5: Use Tamagui's animation presets with custom slow durations for cinematic timing

**Decision**: Extend the Tamagui animation configuration in `animationsRoot.ts` and `animationsRoot.native.ts` with new named presets for luxury timing: `luxurySlow` (500ms), `luxuryMedium` (700ms), and `luxuryCinematic` (1500ms). On web these map to CSS transition durations. On native they map to Reanimated `withTiming` configurations.

**Rationale**: The existing animation config already defines speed presets (`quick`, `medium`, `slow`). Adding luxury-specific presets follows the same pattern and keeps animation timing centralized in the configuration rather than scattered as magic numbers across components.

**Alternatives considered**:

- Using inline duration values in each component: rejected because it makes timing inconsistent and harder to adjust globally if the luxury feel needs tuning.
- Overriding the existing `medium` and `slow` presets to be slower: rejected because it would affect non-luxury components and break existing animation behavior.

## Decision 6: Respect reduced-motion preferences on both web and native

**Decision**: On web, rely on Tamagui's automatic respect for `prefers-reduced-motion` media query. On native, use React Native's `AccessibilityInfo.isReduceMotionEnabled()` to detect the preference and conditionally set animation durations to 0.

**Rationale**: Web browsers handle reduced-motion automatically for CSS transitions. React Native provides the accessibility API for native detection. The luxury animation components will accept a `reducedMotion` flag that short-circuits to instant transitions while preserving color changes.

**Alternatives considered**:

- Ignoring reduced motion on native: rejected because it violates accessibility requirements (FR-010) and platform guidelines.
- Using a third-party accessibility detection library: rejected because React Native's built-in `AccessibilityInfo` API is sufficient.

## Decision 7: Use single-line top borders instead of Tamagui's colored Theme sections for the chore board

**Decision**: Replace the current chore board's `<Theme name="red|yellow|green">` color-block sections with thin 1px top borders and uppercase typographic labels in the monochromatic palette. Urgency is communicated through label weight and gold accents rather than background color changes.

**Rationale**: The luxury editorial design system explicitly rejects colored background blocks in favor of architectural line-based separation. The current implementation wraps each section in a Tamagui `<Theme>` component that changes the entire color context. The redesign removes these theme wrappers and relies on the base theme plus targeted gold accent styling for the overdue section marker.

**Alternatives considered**:

- Keeping colored theme sections with reduced opacity: rejected because even subtle color blocks conflict with the monochromatic palette requirement.
- Using colored left borders on cards instead of section-level color: rejected because vertical colored borders still introduce non-monochromatic elements.

## Decision 8: Adapt web-only decorative elements as progressive enhancements

**Decision**: Exclude visible grid lines, SVG noise textures, vertical text labels, and drop caps from the initial redesign scope. These are web-only CSS features that do not translate to React Native. They may be added as progressive web-only enhancements in a follow-up.

**Rationale**: The spec's scope boundaries explicitly defer these elements. Attempting to implement them cross-platform would require complex conditional rendering and platform detection that adds risk without user-facing value on the primary mobile platform.

**Alternatives considered**:

- Implementing grid lines and noise on web only with `Platform.OS` checks: rejected for the initial scope because it splits the visual experience significantly between platforms.
- Using React Native's canvas or SVG libraries to replicate noise textures: rejected because the performance cost and visual fidelity do not justify the effort for a subtle background texture.
