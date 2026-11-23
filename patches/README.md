# Nextlytics 0.8.0 configuration warning

Nextlytics validates its configuration after applying defaults, so it warns about
deprecated options even when the caller only supplies `capture`. The patch makes
it validate `userConfig` while keeping the resolved runtime configuration intact.
Explicit deprecated options still produce warnings.

`npm install` / `npm ci` apply this patch through `postinstall`. When upgrading
Nextlytics, check whether the upstream validation order is fixed before removing
the patch. `src/lib/nextlytics-config.test.ts` covers both warning cases.
