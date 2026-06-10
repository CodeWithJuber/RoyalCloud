# Install notes (local)

Installed from https://github.com/skovalik/perception-first-design (plugin
layout) into a plain Claude Code skill directory.

Layout change: the plugin keeps `framework/`, `corpus/`, `commands/` and
`scripts/` at the plugin root with the skill at `skills/pfd/`. Here everything
is flattened into this one skill directory so SKILL.md's "plugin-root-relative"
paths (`framework/...`, `corpus/...`) resolve from this directory instead.

Patch applied: `scripts/gen-pfd-index.py` hardcoded the plugin layout
(`<root>/skills/pfd/references/learnings`); it now also accepts the flattened
layout (`<skill>/references/learnings`). Verified:
`python3 scripts/gen-pfd-index.py` → "Generated _index.md and _search.json
from 29 atoms."

License: CC BY-SA 4.0 with practice exemption — see LICENSE and NOTICE here.
