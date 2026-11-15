# AHARWISE Architecture

## Overview

AHARWISE is a single-page React + TypeScript application bundled with Vite. All computation and persistence run locally in the user's browser with zero backend servers or third-party tracking.

## Module Responsibilities

| Layer | File(s) | Responsibility |
| --- | --- | --- |
| Entry & Routing | `src/main.tsx`, `src/App.tsx`, `src/components/AppShell.tsx` | Error boundary, `AppProvider`, `HashRouter` route table, sticky header/stepper, global toast, and educational disclaimer footer. |
| State & Storage | `src/app/context.tsx`, `src/app/contextBase.ts`, `src/app/defaults.ts`, `src/lib/storage.ts` | Loads static JSON datasets on mount; persists validated `Profile` and `Screening` objects in `localStorage` (`aharwiseProfile`, `aharwiseScreening`). |
| Domain Engine | `src/lib/nutrition.ts`, `src/lib/data.ts`, `src/types/index.ts` | Diet hierarchy filtering, allergen & fail-closed safety checks, nutrient-per-rupee ranking, store-adjusted grocery builder, per-person daily intake calculator, household target averaging, gap classification, and safe substitution matching. |
| Pages | `src/pages/GettingStarted.tsx`, `src/pages/Screening.tsx`, `src/pages/Explore.tsx`, `src/pages/About.tsx` | Home landing, Family Profile form, Food Screening log, Budget Explorer, Substitution Finder, Gap Detector, Consolidated Results + Print view, and About/Data reset. |
| Visualization | `src/components/Charts.tsx` | Lazy-loaded `chart.js` / `react-chartjs-2` Bar and Doughnut charts paired with screen-reader-only (`sr-only`) HTML data tables for accessibility. |
| Static Datasets | `public/data/*.json` | Bundled Indian food composition samples (`foods.json`), age-group targets (`nutrient-reference.json`), substitution rules (`substitutions.json`), and store price multipliers (`grocery-prices.json`). |

## Safety & Calculation Flow

```text
Profile (diet, allergies, otherAllergies, avoidedFoods, members, budget, store)
   │
   ▼
filterByProfileSafety() ──[otherAllergies non-empty]──▶ [] (fail-closed)
   │
   ├─▶ Screening Log ──▶ calculateIntake() (ml=150*mult, g=100*mult) ──▶ calculateGap() vs averageTargets()
   ├─▶ Budget Planner ─▶ rankByNutritionPerRupee() ──▶ buildGroceryList(storeMultiplier)
   └─▶ Food Swaps ─────▶ findSubstitutions() (drops unsafe originals & unsafe replacements)
```
