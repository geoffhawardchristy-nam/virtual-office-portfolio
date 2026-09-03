# Virtual office portfolio — split build

Open `index.html` straight from disk. No server, no build step.

    index.html          markup, HUD, panels, editor shell
    css/  base          design tokens, HUD, panels, prompts
          hub           lobby, doors, character markers
          landing       the opening screen
          editor        content editor drawer
          boot-error    the failure banner
    js/   01 data       DATA + DOORS — the text you edit
          02 layouts    LAYOUTS, the Evision 90% pass, tier palettes
          03 engine     renderer, lighting, procedural textures
          04 materials  shared materials, geometry cache, themes
          05 build-room walls, glazing, ceiling fittings
          06 props-core furniture, door frames, plaques, the character
          07 props-logieagle
          08 daynight   sky body, stars, setDaylight, markers, signposts
          09 props-evision
          10 npcs
          11 scene      interactive registry, buildHub, buildOffice
          12 controls   camera, walking, collision, picking
          13 panels     info panels, classic view
          14 main       render loop, boot, content editor

## Rules

Plain `<script>` tags, deliberately — **not** ES modules. Modules are blocked by
CORS on `file://`, so `index.html` would come up blank when opened from disk.
Classic scripts share one global scope, so a top-level `const` in an earlier
file is visible to a later one.

**Load order is the execution order of the old single file.** The files run top
to bottom exactly as before, so the order in `index.html` is not cosmetic —
moving a tag changes behaviour. `boot()` is the last thing in `14-main.js` and
must stay last.

Three.js comes from cdnjs, with unpkg and jsdelivr as fallbacks, then a stub
that keeps the page alive and drops to the text version if all three fail.

## If you split it again

Cut the file with an HTML parser, never a regex over the raw markup. A regex
matched a `<script` that lived inside a JS string and dropped the tags into the
middle of a data literal, which produced `Invalid or unexpected token` and
`DATA is not defined`. Verify by reassembling the pieces and diffing them
against the original before shipping.
