# AHARWISE

Client-side family nutrition screening and education for Indian households. AHARWISE is not a diagnostic, treatment, or clinical meal-planning tool.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

Vite serves the app at `/aharwise/` to match the configured GitHub Pages base path.

## Verify

```sh
npm test
npm run build
```

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` runs tests and builds on pushes to `main`, then deploys `dist/` to GitHub Pages. Enable GitHub Actions as the Pages source in the repository settings. The repository must be named `aharwise` to use the configured `/aharwise/` path.

## Data and privacy

Static sample foods, nutrient targets, substitutions, and store multipliers are in `public/data/`. Profile and screening data are stored only in this browser under `aharwiseProfile` and `aharwiseScreening`. No backend or external grocery API is used.

All bundled nutrient and price values are approximate examples for educational screening only. Always verify allergen information on product labels and consult a qualified professional for individual medical or clinical nutrition needs.

## Brand assets

The supplied Stitch archive contains screenshots and HTML mockups but no original `logo.png` or `logo-icon.png`. Add the approved, unmodified files to `public/assets/` before publishing social image metadata or a custom favicon. AHARWISE uses a text wordmark until the original artwork is available; it does not recreate the missing logo.
