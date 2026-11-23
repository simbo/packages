---
'changelog': patch
---

Document how to handle Dependabot security alerts that cannot be fixed by an
update.

- Add a "Security Alerts" runbook to `MAINTAINING.md`.
- Accept `minimatch` 10 (GHSA-g3hv-75wg-m249) until 2026-12-31, because
  `typedoc` still requires it.
