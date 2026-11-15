# AHARWISE — Eat Smart • Live Healthy

> **Smart, budget-aware family nutrition screening and allergen-safe food swaps for middle-class Indian households.**  
> Built for **BIOHACKERS**.

[![License: MIT](https://img.shields.io/badge/License-MIT-1b7a43.svg)](./LICENSE)
[![Tech Stack](https://img.shields.io/badge/Stack-React%2019%20%7C%20TypeScript%20%7C%20Vite%208-0b5d1e.svg)](#tech-stack)
[![CI Status](https://img.shields.io/badge/CI-lint%20%7C%20test%20%7C%20build-2f6db5.svg)](./.github/workflows/ci.yml)

---

## Problem Statement

Many middle-class Indian households manage multi-generational meals (toddlers, children, adults, and seniors) on a fixed weekly grocery budget. Existing nutrition apps are often calorie-obsessed, Western-food-centric, expensive-ingredient heavy, require invasive sign-ups, or fail to highlight household food allergies alongside affordable local Indian staples like *ragi*, *toor dal*, *moong dal*, *poha*, and seasonal produce.

## Solution Overview

**AHARWISE** is a privacy-first, 100% client-side educational nutrition screening tool. Families enter their household members, strict dietary pattern, allergens, city, store type, and weekly ₹ budget—entirely stored in browser `localStorage`—to screen everyday meals, detect simplified nutrient gaps, explore cost-aware food swaps, and generate a budget-fitting grocery checklist.

> **Disclaimer**: AHARWISE is strictly an **educational nutrition screening** tool. It does not diagnose, treat, or replace advice from a qualified healthcare professional or registered dietitian.

---

## Key Features

- **Nutrition Gap Detector (`/gaps`)**: Compares weekly logged foods against age-group-averaged daily screening targets (protein, fiber, calcium, iron) and a simplified sodium limit, with both **Whole family** and **Per member** views.
- **Location & Store-Aware Budget Planner (`/budget`)**: Ranks foods by a weighted nutrition-per-rupee score, applies sample store multipliers (*Local grocery store*, *Supermarket*, *Weekly market*), and builds an interactive, copyable/printable weekly grocery list within the household's ₹ budget.
- **Allergen-Safe Food Swap Finder (`/substitutions`)**: Suggests practical local swaps (e.g., *Paneer → Moong dal* for cost, *Biscuits → Roasted chana* for protein/fiber, *Milk → Fortified soy milk* for dairy allergy) filtered by reason, nutrient goal, and price.
- **Fail-Closed Allergen & Diet Safety**: Enforces strict hierarchical diet filtering (`vegan` → `vegetarian` → `eggetarian` → `non-vegetarian`) and automatically pauses food suggestions whenever an unclassified custom allergy is added.
- **One-Click Demo & Print/PDF Report (`/results`)**: Try the pre-configured *Rao family* demo immediately or export a clean print-formatted household snapshot.

---

## Screenshots & Demo

Add captured screenshots to `docs/screenshots/` (see [`docs/SCREENSHOTS.md`](./docs/SCREENSHOTS.md)):

| View | Expected Path |
| --- | --- |
| Home & Demo Entry | `docs/screenshots/home.png` |
| Family Profile & Allergen Setup | `docs/screenshots/profile.png` |
| Food Screening & Live Plate | `docs/screenshots/screening.png` |
| Results Snapshot & Charts | `docs/screenshots/results.png` |
| Mobile (`360px`) Responsive View | `docs/screenshots/mobile.png` |

---

## Tech Stack

- **Frontend**: React 19, TypeScript, React Router DOM v7 (`HashRouter`)
- **Build Tool**: Vite 8
- **Charts & Icons**: Chart.js 4, `react-chartjs-2`, `lucide-react`
- **Testing & Linting**: Vitest 5, React Testing Library, `jsdom`, `oxlint`
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml` & `.github/workflows/deploy.yml`)

---

## Architecture & Folder Structure

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the data-flow and safety diagram.

```text
AHARWISE/
├── .github/
│   ├── ISSUE_TEMPLATE/          # Bug report & feature request templates
│   ├── workflows/               # CI verification & GitHub Pages deploy
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   ├── ARCHITECTURE.md          # Module map & safety flow
│   └── SCREENSHOTS.md           # Screenshot placement guide
├── public/
│   ├── assets/                  # Approved brand logo placement folder
│   ├── data/                    # Static Indian foods, targets, swaps & store multipliers
│   └── favicon.svg
├── src/
│   ├── app/                     # AppContext, defaults, demo household
│   ├── components/              # AppShell, accessible Chart.js wrappers
│   ├── lib/                     # nutrition.ts, storage.ts, data.ts, __tests__/
│   ├── pages/                   # GettingStarted, Screening, Explore, About
│   ├── styles/                  # results.css, print.css
│   ├── types/                   # Shared TypeScript interfaces
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env.example
├── LICENSE
└── package.json
```

---

## Prerequisites

- **Node.js** `20.19+` or `22.12+` (tested on Node 22)
- **npm** `10+`

---

## Installation

1. **Clone the repository**:
   ```sh
   git clone https://github.com/Riya29-hub/AHARWISE.git
   cd AHARWISE
   ```

2. **Install dependencies**:
   ```sh
   npm ci
   ```

---

## Environment Variable Setup

AHARWISE runs completely client-side and requires **no API keys or secrets**. If you want to customize optional Vite settings:

```sh
cp .env.example .env
```

Review `.env.example` for supported optional variables (`VITE_BASE_PATH`, `VITE_DEFAULT_CITY`).

---

## How to Run Locally

Start the development server on `http://localhost:3000`:

```sh
npm run dev
```

Verify linting, unit/UI flow tests, and TypeScript + Vite production build:

```sh
npm run lint
npm test
npm run build
```

---

## Usage Guide

1. **Start or Demo**: Open the Home page and click **Try demo family** for an instant walkthrough, or **Start family screening** to enter your own household.
2. **Profile (`#/profile`)**: Add family members by age band (`Toddler`, `Child`, `Teen`, `Adult`, `Senior`), select your shared dietary pattern, mark allergies/avoided foods, and set your city, store type, and weekly budget (`₹`).
3. **Screening (`#/screening`)**: Search or browse food categories, pick foods eaten in a typical week, choose portion sizes (`Small`, `Medium`, `Large`), set weekly servings, and watch **Today's plate** update live.
4. **Explore & Results (`#/budget`, `#/substitutions`, `#/gaps`, `#/results`)**: Review nutrient gaps, store-adjusted grocery costs, safe swap comparisons, and print/copy your household summary.
5. **Clear Data (`#/about`)**: Remove all saved `localStorage` data at any time with one confirmation step.

---

## Build & Deployment

Build the static production bundle into `dist/`:

```sh
npm run build
```

- **GitHub Pages**: `.github/workflows/deploy.yml` runs tests, builds `dist/`, and deploys automatically on pushes to `main`. (If deploying to a project subpath such as `/aharwise/`, set `base: '/aharwise/'` in `vite.config.ts`.)
- **Static Hosting (Vercel / Netlify / Cloudflare Pages / Cloud Run)**: Serve the `dist/` directory at root `/`.

---

## Future Roadmap

- [ ] Regional Indian city price presets beyond Bengaluru (Mumbai, Delhi, Chennai, Hyderabad, Pune)
- [ ] Multilingual UI support (Hindi, Kannada, Tamil, Telugu, Marathi)
- [ ] Expanded IFCT-aligned food catalog and seasonal produce availability tags
- [ ] Optional offline PWA caching for low-connectivity households

---

## Team Members — BIOHACKERS

- **Harshitha Riya** — Project Lead & Full-Stack Engineering ([Riya29-hub](https://github.com/Riya29-hub))
- **[Team Member 2 Name]** — Nutrition Dataset & Research
- **[Team Member 3 Name]** — UI/UX & Accessibility

*(Update contributor names and roles before final hackathon submission.)*

---

## Acknowledgements

- Built for the **BIOHACKERS** hackathon track
- Icons by [Lucide](https://lucide.dev/)
- Charts powered by [Chart.js](https://www.chartjs.org/) and [react-chartjs-2](https://reactchartjs-2.js.org/)

---

## License

Licensed under the [MIT License](./LICENSE) © 2026 Team BIOHACKERS.
