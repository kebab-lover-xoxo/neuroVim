# Mnemo — UI Context

## Aesthetic

Terminal-native. The interface draws from tmux, Ghostty, and Neovim — pane-based layout, monospace hierarchy, status lines, minimal chrome. Every element earns its place. Nothing is decorative.

## Theme

Dark. Slate is the foundation — backgrounds, surfaces, and borders all live in the slate scale. The four accent colors appear sparingly as gradients, highlights, and state signals:

- `#0175f0` — primary action, focus rings, active archetype
- `#ea4335` — destructive actions, lapse indicators, error state
- `#f9bd05` — warnings, Miller cap approach (7+ atoms), due-soon
- `#35a853` — success, graduation, good/easy rating confirmation

Gradients are subtle and directional — used on active pane borders, selection highlights, and the session status bar. Never on backgrounds. Never animated.

## Rules

**Variables must be predefined.** All color tokens, spacing scale, font sizes, border radii, and shadow values must be declared as CSS custom properties and Tailwind config extensions before use anywhere in the component tree. No raw hex values in component files.

**Tailwind config is the source of truth.** Custom colors, font families, and any extended scale values are registered in `tailwind.config.ts`. Components use only named utility classes — no arbitrary `[value]` syntax except where a design token genuinely does not exist.

**Typography is monospace-first.** A monospace font stack handles all UI text: labels, values, navigation, status lines. A secondary sans-serif is permitted for long-form note body content only. Font sizes follow a tight scale — three or four steps maximum.

**Spacing is systematic.** Use the Tailwind spacing scale without deviation. No one-off margin or padding values.

**Borders over shadows.** Depth is communicated with borders and background contrast, not box shadows. The one exception is a faint inset shadow on active input fields.

**State is communicated by color shift and border weight alone.** No animations except a single opacity transition (under 100ms) for pane focus change. No transforms, no slides, no bounces.

**Pane model.** The three archetypes (Notes, Working, Recall) are panes, not pages. The layout feels tiled. The active pane has a weighted border using the primary accent gradient. Inactive panes recede into the slate background.

**Status bar.** A single bottom status bar, Neovim-style, carries session state, active chunk type, atom count, and current archetype. It is always visible. It never wraps.

**Density is high.** Line heights are tight. Padding is conservative. The interface fits more information in less space than a typical web app — this is intentional.
