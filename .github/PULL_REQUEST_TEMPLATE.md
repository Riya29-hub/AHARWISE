## Summary

<!-- Briefly describe what this pull request changes and why. -->

## Related Issue

<!-- Link the issue this PR addresses (e.g., Fixes #12). -->

## Type of Change

- [ ] Bug fix (non-breaking change that resolves an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that changes existing behavior or storage schema)
- [ ] Data / nutrition reference update (`public/data/*.json`)
- [ ] Documentation / repository maintenance

## Verification Checklist

- [ ] `npm run lint` passes with zero errors (`oxlint`)
- [ ] `npm test` passes (`vitest run`)
- [ ] `npm run build` succeeds (`tsc -b && vite build`)
- [ ] Allergen & dietary safety rules verified (fail-closed behavior preserved for custom `otherAllergies`)
- [ ] Tested across desktop and mobile (`360px`) viewports without horizontal overflow or broken navigation
- [ ] Updated `README.md`, `CHANGELOG.md`, or `docs/` if user-facing behavior changed
