---
name: Obsidian Precision
colors:
  surface: '#0e141b'
  surface-dim: '#0e141b'
  surface-bright: '#343942'
  surface-container-lowest: '#090e16'
  surface-container-low: '#171c24'
  surface-container: '#1b2028'
  surface-container-high: '#252a32'
  surface-container-highest: '#30353d'
  on-surface: '#dee2ed'
  on-surface-variant: '#b9cbbd'
  inverse-surface: '#dee2ed'
  inverse-on-surface: '#2b3139'
  outline: '#849588'
  outline-variant: '#3b4a40'
  surface-tint: '#00e293'
  primary: '#cdffde'
  on-primary: '#003921'
  primary-container: '#00f5a0'
  on-primary-container: '#006b43'
  inverse-primary: '#006c44'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#f2f3ff'
  on-tertiary: '#002a78'
  tertiary-container: '#cbd6ff'
  on-tertiary-container: '#0052d8'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#50ffaf'
  primary-fixed-dim: '#00e293'
  on-primary-fixed: '#002111'
  on-primary-fixed-variant: '#005232'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#0e141b'
  on-background: '#dee2ed'
  surface-variant: '#30353d'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 3.5rem
    fontWeight: '600'
    lineHeight: 4rem
    letterSpacing: -0.04em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 2.25rem
    fontWeight: '600'
    lineHeight: 2.75rem
    letterSpacing: -0.03em
  headline-xl:
    fontFamily: Geist
    fontSize: 2.25rem
    fontWeight: '600'
    lineHeight: 2.75rem
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: 2.25rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 1.5rem
    fontWeight: '500'
    lineHeight: 2rem
    letterSpacing: -0.02em
  title-md:
    fontFamily: Geist
    fontSize: 1.125rem
    fontWeight: '500'
    lineHeight: 1.625rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
    letterSpacing: -0.005em
  body-md:
    fontFamily: Geist
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.375rem
    letterSpacing: 0em
  body-sm:
    fontFamily: Geist
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1.125rem
    letterSpacing: 0.01em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 0.8125rem
    fontWeight: '500'
    lineHeight: 1.125rem
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 0.6875rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.04em
  metric-display:
    fontFamily: JetBrains Mono
    fontSize: 2rem
    fontWeight: '600'
    lineHeight: 2.25rem
    letterSpacing: -0.03em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 2rem
  margin-lg: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system expresses a disciplined, high-performance aesthetic rooted in Technical Minimalism. Designed for data-intensive workflows, developer tooling, and quantitative execution, it strips away decorative noise in favor of stark contrast, absolute legibility, and architectural precision.

### Character & Emotional Response
The interface evokes the feel of high-end avionics instrumentation or precision-milled carbon: cold, focused, deterministic, and unmistakably fast. It inspires absolute confidence through restraint—every pixel either communicates critical state or recedes completely.

### Aesthetic Foundation
- **Monochrome Dominance:** A deep obsidian base layered with neutral cool grays provides depth without saturation fatigue.
- **Surgical Accents:** Electric Emerald is reserved exclusively for forward momentum, positive delta, active streaks, and primary execution points.
- **Architectural Structure:** Fine, hairline borders delineate modules with mathematical cadence, replacing heavy Drop Shadows and muddy blur planes.

## Colors

The palette is engineered around dark-mode operational clarity, utilizing high-contrast grayscale foundations with a laser-focused chromatic signature.

### Palette Architecture
- **Canvas Base (`#0B0C0E`):** Pure obsidian. Serves as the global backdrop to maximize contrast and eliminate visual fatigue.
- **Surface Elevation (`#16181D` to `#1F2228`):** Layered graphite containers with subtle separation.
- **Text & Foreground:** Crisp pure white (`#FFFFFF`) for primary headings and critical readouts; cool silver (`#E2E4E9`) for body content; muted graphite (`#8B909A`) for secondary metadata; deep slate (`#4A4D57`) for non-interactive framing and inactive glyphs.
- **Electric Emerald Accent (`#00F5A0` / `#10B981`):** A high-luminance teal-emerald duo. Used strictly for success verification, streak continuity, telemetry upticks, and top-tier calls-to-action.
- **Cobalt Accent (`#2563EB`):** Secondary semantic anchor reserved for informational systems, telemetry linkages, and specialized data dimensions.

### Usage Governance
Accent saturation must never exceed 5% of visible canvas real estate. Elements competing with data priority must default to monochrome states.

## Typography

Typography relies on the surgical geometry of Geist paired with JetBrains Mono for telemetry, quantitative counters, and micro-labels.

### Hierarchy & Application
- **Display & Headings (Geist):** Tight letter tracking and calculated optical density give headers a chiselled, modern presence. Line heights are tightly reined to prevent spatial decay.
- **Body Elements (Geist):** Neutral, unobtrusive, and highly legible across varying contrast tiers.
- **Data & Telemetry (JetBrains Mono):** All raw numbers, operational flags, keyboard shortcuts, and streak counts render in JetBrains Mono. Tabular figures ensure aligned layout stacks in live dashboards without jitter.

## Layout & Spacing

The layout is built upon an uncompromising 4px baseline grid within a fluid-column scaffolding. It adapts dynamically to preserve data density without claustrophobia.

### Grid & Breakpoints
- **Desktop (1280px+):** 12-column fluid grid, 1.5rem (24px) gutters, 3rem (48px) exterior margin constraints. Maximum readable shell bounded at 1440px.
- **Tablet (768px - 1279px):** 8-column layout, 1rem (16px) gutters, 2rem (32px) margins. Lateral panels collapse to slide-overs.
- **Mobile (< 768px):** 4-column layout, 1rem (16px) gutters, 1rem (16px) margins. Multi-metric modules stack vertically into segmented lists.

### Spatial Discipline
Internal component spacing follows strict power-of-two multiples (`0.25rem`, `0.5rem`, `1rem`, `1.5rem`, `2.5rem`). Information-dense segments leverage `space-xs` and `space-sm` for metric pairing, while canvas separation leverages `space-xl`.

## Elevation & Depth

Visual hierarchy rejects diffused blurry dropshadows in favor of tonal surface tiers and razor-thin hairline borders.

### Surface Tiers
- **Level 0 (Canvas):** `#0B0C0E` — The subterranean baseline.
- **Level 1 (Sub-Panels & Structural Modules):** `#121418` — Bordered with 1px solid `rgba(255, 255, 255, 0.07)`.
- **Level 2 (Cards & Active States):** `#1A1C21` — Bordered with 1px solid `rgba(255, 255, 255, 0.12)`.
- **Level 3 (Overlays, Modals, Menus):** `#22252C` — Bordered with 1px solid `rgba(255, 255, 255, 0.18)` accompanied by an ambient, low-spread occlusion shadow: `0 8px 32px -4px rgba(0, 0, 0, 0.7)`.

### Ghost Borders & Contrast Edges
Depth is defined by edges, not diffuse shadows. Interactive panels react upon hover by sharpening their border threshold to `rgba(255, 255, 255, 0.28)` or applying a 1px inner keyline of the primary emerald accent (`rgba(0, 245, 160, 0.35)`).

## Shapes

The geometric framework favors tight, engineered corners over bubbly radiuses, reinforcing an instrument-grade aesthetic.

### Corner Rules
- **Base UI Units (`0.25rem` / 4px):** Applied to inputs, buttons, chips, micro-badges, and code snippets.
- **Intermediate Units (`0.5rem` / 8px):** Applied to analytical cards, flyouts, and dropdown sheets.
- **Structural Overlays (`0.75rem` / 12px):** Applied strictly to root modals and floating notification toasts.
- **Absolute Sharpness (`0px`):** Data tables, divider rails, status indicator dots, and split utility segments remain unrounded.

## Components

### Buttons
- **Primary:** Solid `#00F5A0` background with `#0B0C0E` ultra-bold text. No borders. Interactive hover: `#10B981` with high-luminance edge-glow.
- **Secondary:** Semi-transparent surface (`#16181D`), 1px outline of `rgba(255, 255, 255, 0.12)`, pure white text. Hover brings edge outline to `rgba(255, 255, 255, 0.3)`.
- **Ghost/Tertiary:** Zero fill, `#8B909A` text. Hover brings `#E2E4E9` text and subtle `rgba(255, 255, 255, 0.05)` fill.

### Input Fields
- Deep carbon base (`#121418`), 1px border `rgba(255, 255, 255, 0.1)`. Typography set to `body-md` in `#E2E4E9`.
- **Focus State:** Border shifts instantaneously to `#00F5A0` with a 1px outer ring in `rgba(0, 245, 160, 0.25)`. Monospaced label floats or sits cleanly above with `label-sm` sizing.

### Chips & Badges
- Micro-footprint (padding: `0.125rem 0.5rem`, typography: `label-sm`).
- **Streak & Telemetry Badge:** Background `rgba(0, 245, 160, 0.08)`, border `1px solid rgba(0, 245, 160, 0.3)`, text `#00F5A0`. Houses an optional 4px solid pulse dot.
- **Neutral Tag:** Background `rgba(255, 255, 255, 0.04)`, border `1px solid rgba(255, 255, 255, 0.08)`, text `#8B909A`.

### Cards & Modules
- Foundation: `#121418` fill, `1px solid rgba(255, 255, 255, 0.06)`, `0.5rem` corner radius.
- Padding uses `space-md` on compact widgets and `space-lg` on data-display dashboards. 
- Integrated header slots carry a bottom 1px divider `rgba(255, 255, 255, 0.06)`.

### Selection Controls (Checkboxes & Radios)
- Box footprint: 16x16px, corner radius `2px` (checkbox) or circular (radio).
- Inactive: Border `1px solid #4A4D57`, background transparent.
- Active: Background `#00F5A0`, glyph `#0B0C0E`.

### Data Tables & Lists
- Compact row height (40px default, 32px dense).
- Alternating or hairline border-bottom (`1px solid rgba(255, 255, 255, 0.04)`).
- Header row renders in `label-sm` uppercase, tracking `0.04em`, text `#8B909A`.