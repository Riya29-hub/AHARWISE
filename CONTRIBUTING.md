# Contributing to AHARWISE

Thank you for helping improve **AHARWISE**! Whether you are fixing a bug, refining regional Indian food datasets, or improving accessibility, contributions are welcome.

## Development Workflow

1. **Fork** the repository on GitHub and clone your fork locally.
2. **Create a feature branch** from `main`:
   ```sh
   git checkout -b feat/your-short-description
   ```
3. **Install dependencies**:
   ```sh
   npm ci
   ```
4. **Make your changes** and keep edits focused and modular.
5. **Verify locally** before committing:
   ```sh
   npm run lint
   npm test
   npm run build
   ```
6. **Commit your changes** using clear, descriptive commit messages (Conventional Commits recommended, e.g. `fix: align liquid ml portions in gap calculation`, `docs: update food dataset notes`).
7. **Push** your branch and **open a Pull Request** against `main` using the PR template.

## Code Style & Quality Rules

- **TypeScript**: Strict typing (`tsc -b` must pass with zero errors; avoid `any` and non-null assertions on unvalidated lookups).
- **Linting**: Follow the rules in `.oxlintrc.json` (`npm run lint` must exit with 0 warnings and 0 errors).
- **Safety Invariants**:
  - Never allow foods matching selected allergens or stricter diet rules into grocery lists, gap suggestions, or substitution results.
  - Keep fail-closed behavior when unclassified `otherAllergies` are present.
  - Never introduce medical diagnosis claims or clinical supplement prescriptions; AHARWISE is strictly educational screening.
- **Testing**: Add or update Vitest unit or React Testing Library flow tests in `src/lib/__tests__/` whenever nutrition math, storage validation, or user flows change.
