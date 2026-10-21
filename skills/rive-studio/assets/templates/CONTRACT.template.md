# Rive contract: <piece>

The agreement between the `.riv` file and the code. Names are exact and case-sensitive, ASCII only. `scripts/rive-probe.mjs --contract` reads the json block below and reports every difference. Written in English; notes for Nati in Hebrew go in a `.rtl.md` file.

## Files

- Source: <CLI project design/rive/<piece>/cli | editor file name or link | delivered .riv>
- Runtime file: <public/rive/piece.riv | app/src/main/res/raw/piece.riv | assets/rive/piece.riv>
- Assets: <embedded | referenced, hosted at ... | Rive CDN>
- Runtime versions: <web @rive-app/webgl2 x.y | Android rive-android x.y | ...>

## Structure (machine-readable, the probe checks this)

```json
{
  "file": "<piece>.riv",
  "maxKB": 150,
  "artboards": [
    { "name": "<Artboard>", "stateMachines": ["Main"], "viewModel": "<ViewModel>" }
  ],
  "viewModels": [
    {
      "name": "<ViewModel>",
      "properties": [
        { "name": "isHovered", "type": "boolean", "direction": "app-to-rive", "default": false },
        { "name": "progress", "type": "number", "direction": "app-to-rive", "default": 0, "range": [0, 100] },
        { "name": "status", "type": "enum", "enum": "<Enum>", "direction": "app-to-rive", "default": "idle" },
        { "name": "celebrate", "type": "trigger", "direction": "app-to-rive" },
        { "name": "ctaPressed", "type": "trigger", "direction": "rive-to-app" },
        { "name": "selectedIndex", "type": "number", "direction": "rive-to-app", "default": 0 },
        { "name": "isRtl", "type": "boolean", "direction": "app-to-rive", "default": false },
        { "name": "prefersReducedMotion", "type": "boolean", "direction": "app-to-rive", "default": false }
      ]
    }
  ],
  "enums": [
    { "name": "<Enum>", "values": ["idle", "loading", "success", "error"] }
  ],
  "events": [],
  "shots": [
    { "name": "rest", "set": {}, "advanceMs": 50 },
    { "name": "loading", "set": { "status": "loading" }, "advanceMs": 600 },
    { "name": "success", "set": { "status": "success" }, "fire": ["celebrate"], "advanceMs": 900 },
    { "name": "rtl", "set": { "isRtl": true }, "advanceMs": 400 },
    { "name": "reduced-success", "set": { "prefersReducedMotion": true, "status": "success" }, "advanceMs": 400 }
  ]
}
```

`events` stays empty unless the file needs a Rive event for open-url, audio, or legacy reasons.

## Properties: meaning and owner

| Property | Type | Direction | Range or values | Set by | Used by | Notes |
|---|---|---|---|---|---|---|
| isHovered | boolean | app to Rive | | pointer enter and leave on the DOM control | hover layer | never set on touch |
| progress | number | app to Rive | 0-100 | upload progress | meter fill | the file smooths the display |
| status | enum | app to Rive | idle, loading, success, error | request lifecycle | main layer | loading exits at any frame |
| celebrate | trigger | app to Rive | | fired once on success | payoff animation | |
| ctaPressed | trigger | Rive to app | | a listener in the file | the app observes it | only when the press happens inside Rive |
| selectedIndex | number | Rive to app | 0-n | a listener in the file | the app's selection state | the app observes it |
| isRtl | boolean | app to Rive | | the page or app direction, at load | direction-bearing layers | mirrored motion, or a right-to-left layout |
| prefersReducedMotion | boolean | app to Rive | | platform setting, at load and on change | every layer | instant transitions, final frames, no loops |

## States

| State | Reached when | Rest pose | Exits to | If interrupted |
|---|---|---|---|---|
| idle | default | <pose> | hover, pressed, loading | |

## Signals (Rive to app)

| Trigger or property | Fires when | Code reaction |
|---|---|---|
| ctaPressed | <moment in the file> | <what the code does> |

## Motion spec (from the approved sketch)

| Beat | ms | Easing (cubic-bezier) | What moves | Amplitude |
|---|---|---|---|---|
| hover | 0-150 | 0.2, 0, 0, 1 | <part> | <px / %> |

## Accessibility and reduced motion

- Label: "<accessible name, in the page language>", or decorative (hidden from assistive tech)
- Keyboard: <which DOM control drives which property; the DOM focus ring stays>
- Reduced motion: `prefersReducedMotion` true gives <final frames (client websites: always) / short fades (apps only)>
- Long motion: <stops after one cycle / pause control at ...>

## Change log

| Date | Change | By |
|---|---|---|
| <YYYY-MM-DD> | initial contract | <name> |
