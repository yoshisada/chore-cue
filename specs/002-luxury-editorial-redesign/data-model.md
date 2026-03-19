# Data Model: Luxury Editorial Redesign

## Design Token Set

**Purpose**: Defines the centralized visual language for the luxury editorial aesthetic. Applied consistently across all platforms and components.

**Fields**:

- `palette`: Ordered color scale from lightest to darkest, mapped to Tamagui's `color1`-`color12` token slots
- `background`: Primary surface color (warm alabaster in light mode, rich charcoal in dark mode)
- `foreground`: Primary text color (rich charcoal in light mode, warm alabaster in dark mode)
- `mutedBackground`: Subtle surface elevation color (pale taupe)
- `mutedForeground`: Secondary text color (warm grey)
- `accent`: Gold accent color for hover, focus, and emphasis states
- `accentForeground`: Text color used on top of accent surfaces
- `borderColor`: Default border color (foreground at reduced opacity for dividers, full opacity for structural borders)
- `shadowColor`: Shadow base color with low opacity for subtle depth
- `headingFontFamily`: High-contrast serif typeface with per-weight font file mappings
- `bodyFontFamily`: Humanist sans-serif typeface with per-weight font file mappings
- `borderRadius`: Global radius value, set to zero for all elements
- `animationDurations`: Named timing values for interaction (500ms), color transitions (700ms), and cinematic reveals (1500ms)

**Relationships**:

- Referenced by all Component Variants for consistent visual behavior
- Light and dark modes each define a complete token mapping

**Validation Rules**:

- Background and foreground must achieve at least WCAG AA contrast ratio (4.5:1)
- Muted foreground must achieve at least 4.5:1 contrast against background
- Accent color must achieve at least AA contrast when used as text on the background
- Border radius must be zero for all components
- Animation durations must be at least 500ms for interactions (unless reduced motion is active)

**State Transitions**:

- `light -> dark` when user or system toggles color scheme
- `full-motion -> reduced-motion` when user enables reduced motion accessibility setting

## Component Variant: Button

**Purpose**: Defines the luxury editorial button styling with gold sliding reveal animation.

**Fields**:

- `variant`: One of `primary`, `secondary`, `link`
- `size`: One of `default` (48pt height), `large` (56pt height), `small` (40pt height)
- `label`: Button text, rendered uppercase with wide letter spacing in the sans-serif font

**Visual States**:

- **Primary default**: Dark background, light text, subtle shadow
- **Primary hover/press**: Gold overlay slides in from left edge, text remains visible above overlay, shadow deepens
- **Secondary default**: Transparent background, thin structural border, dark text
- **Secondary hover/press**: Background fills to dark, text inverts to light
- **Link default**: Text only, no background or border
- **Link hover/press**: Gold text color or underline appears
- **Disabled**: Reduced opacity, no interaction response

**Validation Rules**:

- All sizes must maintain minimum 48pt touch target (small size uses padding to reach minimum)
- Text must remain readable during gold overlay animation
- Animation must complete in at least 500ms (unless reduced motion)

## Component Variant: Input

**Purpose**: Defines the luxury editorial text input with underline-only styling.

**Fields**:

- `placeholder`: Italic serif text in muted foreground color
- `value`: Sans-serif text in foreground color
- `borderStyle`: Bottom border only, no surrounding box

**Visual States**:

- **Default**: Single bottom border in foreground color at reduced opacity
- **Focus**: Bottom border transitions to gold accent color
- **Filled**: Sans-serif text, bottom border returns to default color
- **Disabled**: Reduced opacity, no interaction response
- **Error**: Bottom border in warm red, not the accent color

**Validation Rules**:

- Input height must be at least 48pt for touch target compliance
- Placeholder text must be distinguishable from entered text (italic serif vs regular sans-serif)
- Focus transition must complete in at least 500ms

## Component Variant: Card

**Purpose**: Defines the luxury editorial card with architectural top border definition.

**Fields**:

- `hasFeaturedBorder`: Whether the card uses a thicker gold top border for emphasis
- `content`: Card body with generous internal padding

**Visual States**:

- **Default**: Transparent background, thin 1px top border, generous padding
- **Hover/Press**: Subtle background tint, shadow deepens slightly
- **Featured**: Thicker top border in gold accent color

**Validation Rules**:

- Cards must not use full surrounding borders — top border only
- Shadow evolution on hover must be subtle (low opacity increase)
- Internal padding must exceed typical app spacing norms

## Component Variant: Section Label

**Purpose**: Defines the uppercase typographic label used to introduce chore board sections.

**Fields**:

- `text`: Section name (e.g., "Overdue", "Due Soon", "Upcoming")
- `hasAccent`: Whether the label includes a gold accent marker (used for overdue)

**Visual States**:

- **Default**: Uppercase, small font size, wide letter spacing, sans-serif font, muted foreground color
- **Accented**: Same styling with gold color applied to text or adjacent decorative element

**Validation Rules**:

- Letter spacing must be visibly wider than body text
- Font size must be smaller than body text to create editorial contrast
- Must be uppercase regardless of input casing

## Theme Configuration

**Purpose**: Maps the luxury editorial token set to Tamagui's theme structure for both light and dark modes.

**Light Mode Mapping**:

- `background` -> warm alabaster
- `color` (text) -> rich charcoal
- `color1` -> warm alabaster (lightest)
- `color12` -> rich charcoal (darkest)
- `borderColor` -> warm grey
- `shadowColor` -> charcoal at low opacity
- `placeholderColor` -> warm grey

**Dark Mode Mapping**:

- `background` -> rich charcoal
- `color` (text) -> warm alabaster
- `color1` -> rich charcoal (lightest in dark context)
- `color12` -> warm alabaster (lightest)
- `borderColor` -> lighter warm grey
- `shadowColor` -> black at moderate opacity
- `placeholderColor` -> muted warm tone

**Validation Rules**:

- Both modes must pass WCAG AA contrast checks for primary and secondary text
- Gold accent must remain the same hue in both modes (may adjust opacity or lightness for contrast)
- Theme switching must not cause layout shifts or font changes — only colors and shadows change
