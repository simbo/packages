---
'@simbo/eslint-config': minor
---

Base the Unicorn configurations on the `recommended` preset instead of `all`.

- Rules that only `all` enables are no longer active: `comment-content`,
  `consistent-destructuring`, `consistent-function-style`,
  `custom-error-definition`, `id-match`, `iteration-fallback-style`,
  `no-array-front-mutation`, `no-invalid-file-input-accept`,
  `no-keyword-prefix`, `no-manually-wrapped-comments`,
  `no-missing-local-resource`, `no-repeated-call-wrappers`,
  `no-unnecessary-default-arguments`, `no-unreadable-new-expression`,
  `no-unsafe-dom-html`, `no-unused-properties`, `prefer-dispose`,
  `prefer-import-meta-properties`, `prefer-iterator-concat`,
  `prefer-json-import`, `prefer-short-arrow-method`, `prefer-uint8array-hex`,
  `require-post-message-target-origin` and `string-content`.
- Remove the overrides that only disabled rules `recommended` already leaves
  off.
- Update `eslint-plugin-unicorn` to ^79.0.0.

Updated Unicorn rules can report new errors. Enable any of the rules above in
your own configuration to keep using them.
