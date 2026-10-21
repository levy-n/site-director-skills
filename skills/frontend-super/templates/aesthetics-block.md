# Aesthetics Block Templates

Copy one of these blocks into your project's CLAUDE.md to enforce distinctive design.

## Full Block (~200 tokens)

```xml
<frontend_aesthetics>
Avoid AI slop. Create distinctive, memorable interfaces.
Typography: Ban Inter/Roboto/Arial. Use [font pair]. Weight 200 vs 800. Size jumps 3x+.
Color: [Palette]. Dominant [color] + [accent]. OKLCH preferred. No purple gradients.
Motion: Framer Motion. Staggered reveals. Spring physics. prefers-reduced-motion. Max 0.6s UI.
Layout: [Style]. Break grid where it serves content. 8pt spacing grid.
Spacing: Internal <= external (Gestalt). Section breaks 48-64px minimum.
Texture: Grain overlay, gradient meshes, depth. No flat solid backgrounds.
</frontend_aesthetics>
```

## Minimal Block (~50 tokens)

```xml
<frontend_aesthetics>
No AI slop. [Font A] + [Font B]. Palette: [hex values]. Framer Motion staggered animations.
Asymmetric layouts. 8pt grid. Grain texture. OKLCH colors.
</frontend_aesthetics>
```

## Hebrew/RTL Block (~100 tokens)

```xml
<frontend_aesthetics>
No AI slop. Hebrew RTL. dir="rtl" on root. CSS logical properties ONLY.
Typography: [Hebrew display font] + [Hebrew body font]. Weight 200 vs 800. No letter-spacing. No italics. Line-height 1.7-1.8.
Color: [Palette]. OKLCH preferred. Warm tinted neutrals.
Motion: Framer Motion. Enter from RIGHT. Spring physics. prefers-reduced-motion.
Layout: 8pt grid. Asymmetric. Section breaks 48-64px.
</frontend_aesthetics>
```

## Usage Instructions

1. Replace `[bracketed values]` with your project's actual fonts, colors, and style
2. Place inside your project's `CLAUDE.md` (loaded every session)
3. Keep the block under 200 tokens for minimal context cost
4. The block provides ~400 tokens of focused guidance that research shows dramatically improves output distinctiveness
