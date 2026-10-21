# Build path: the Rive Editor MCP

Claude edits the file that is open in the Rive desktop Editor, live, while the user watches. Use it when the user wants to work in the editor together, when the piece needs editor-only craft (illustration, bones, meshes) that the CLI path would hand off anyway, or to wire up structure inside an existing editor file. Official page: https://rive.app/docs/editor/ai/mcp

## Contents
1. Setup on Windows
2. Before the first edit
3. The edit loop
4. Units and conventions
5. What it is good and bad at
6. Recovery and reporting

---

## 1. Setup on Windows

Prerequisites the user does personally (Claude never signs in or installs apps for them):
- Install the Rive desktop Editor for Windows from https://rive.app/downloads and keep it updated (the release that moved the MCP server onto Rive's own stack, 0.9.104, fixed earlier connection failures).
- Sign in, and open a file that has at least one artboard. The server only exists while the desktop Editor is running; the browser editor has no MCP.

Then register the server with Claude Code. This changes persistent configuration, so ask first. `--scope user` makes it available in every project:

```powershell
claude mcp add --transport http --scope user rive http://127.0.0.1:9791/mcp
```

- Start Claude Code after the Editor is open; a session started earlier does not see the server. Check with `/mcp` (the server shows as connected) and list its tools.
- Older guides show `http://localhost:9791/sse`, Mac only and Cursor only: that version was retired. Use the `/mcp` URL above.
- The official page still mentions typing "End Prompt" after a request so the AI may change the file. Claude Code testers do not report needing it; if edits do not apply, try it once.
- Claude Desktop (not Claude Code) only accepts stdio servers; a community bridge exists (`npx -y mcp-remote http://127.0.0.1:9791/mcp`). Prefer Claude Code.

## 2. Before the first edit

1. **Discover the tools.** List the Rive tools in the session and read their input schemas. Rive publishes capability groups, not tool names, and the set changes between Editor releases: trust the live schemas over any name in this file.
2. **Identify the target.** Get the open and active file and its artboards. The selected artboard and the active one can differ.
3. **Protect the user's work.** Edits hit the live open file. Before structural or hard-to-reverse work, ask the user to save, or export a `.rev` backup if a tool offers it, and record that in the ledger. Work on a duplicate file for experiments.
4. **Survey shallowly.** Read the artboard hierarchy one level at a time, narrowing to the branches that matter. Get object ids from search or query tools; names can repeat, ids cannot.
5. **Record the before-state**: runtime-facing names (artboards, state machines, view models, properties, events) and current values. These names are an API; never rename one without the user's approval and a contract update.

## 3. The edit loop

Build in the simplest-mechanism order: timeline animations, then the state machine, then the view model and bindings, then listeners, layouts and constraints, and Luau scripts only when nothing native does the job.

For each step of the contract:
1. **Check the schema** of what you will touch: property types, units, ranges and enum values from the property-key query. Read current values before writing.
2. **Make one small, single-purpose change.** Prefer ids over names. Edits to the same document run one at a time; independent reads may run in parallel.
3. **Read the result.** A successful response does not mean every property applied: check per-property errors (unknown id, type mismatch, invalid enum, read-only).
4. **Re-query the same targets** and compare with the intent.
5. **Never overwrite a timeline or state machine that is in use**; add a new one and switch to it.
6. After a structural milestone (view model done, state machine done), ask the user to glance at the editor or capture it, and run a state machine simulation if a tool offers one.

Sizing and layout prompts work better with explicit numbers: dimensions, names, font family and weight, hug or fill sizing. Some layout operations refuse text as a direct child; wrap the text in its own layout.

## 4. Units and conventions

| Thing | Editor MCP (as reported by testers) | RML / CLI | Web runtime |
|---|---|---|---|
| Rotation | degrees | radians | radians (scripting) |
| Opacity, scale, trim | percentage-style, 100 = 100% (check each range) | type-specific, see `rive schema` | 0-1 |
| Animation time | check the schema | frames (60 fps default) | seconds or ms per API |
| Enum values | the exact values from the schema | the names from `rive schema` | the value strings |

The table is the reason to always read the schema first: the same "50" means different things on different surfaces.

## 5. What it is good and bad at

Good at: repetitive structure (state machines with many states and layers, view models, properties and instances, component lists), layouts, wiring listeners, writing and debugging Luau scripts and WGSL shaders with diagnostics and console output.

Weak at: drawing beautiful illustration from a prompt. Bring shapes in instead: import the sketch's cleaned SVG, or an asset the user provides, and let the MCP do structure and motion. Simulations report states and transitions, not pixels, so they never prove the look.

Caveats reported in the field: the Editor can crash mid-session (save often); a new script can take a few seconds to appear; editor screenshots do not run scripts; a listener without a target is not exported to the runtime; exporting from MCP can include unsaved changes.

## 6. Recovery and reporting

- If a needed change is unsupported, stop instead of approximating it destructively, and give the user exact manual editor steps for that part (the build sheet format).
- After an error, re-read the session state before retrying; do not repeat a failing call without changing something relevant.
- Editor evidence is not runtime evidence. After export, run `scripts/rive-probe.mjs` on the `.riv` against the contract.
- Report with evidence labels: **Verified** (observed in the editor or runtime), **Inspected** (configuration read, behaviour not run), **Unverified** (and the check that remains). Include the before and after contract, the changed objects and any partial failure with its recovery steps.
