# Changelog

All notable changes to **AHARWISE** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-15

### Added
- **Family Profile Builder (`/profile`)**: Household setup for member age groups (`toddler`, `child`, `teen`, `adult`, `senior`), diet hierarchy (`vegan`, `vegetarian`, `eggetarian`, `non-vegetarian`), allergen checkboxes, fail-closed custom allergies, avoided foods, city, store type, and weekly grocery budget in INR.
- **Nutrition Screening (`/screening`)**: Searchable and category-filterable Indian food catalog with portion multipliers (`Small`, `Medium`, `Large`), weekly serving counts, and a live "Today's plate" meter synced to household average targets.
- **Budget Explorer (`/budget`)**: Nutrient-per-rupee ranking table, store-multiplier grocery list generator, interactive checklist, copy/print/download export, spend-mix Doughnut chart, and cost-reducing food swaps.
- **Food Swap Finder (`/substitutions`)**: Allergen- and diet-safe substitution engine filterable by reason (`allergy`, `cost`, `availability`, `nutrition`) and nutrient goal (`protein`, `fiber`, `iron`, `calcium`), with nutrient and price comparison charts.
- **Nutrition Gap Detector (`/gaps`)**: Whole-family and per-member comparison against simplified screening targets, sodium limit gauge, and budget-aware food suggestions.
- **Results Snapshot & Print View (`/results`)**: Consolidated household summary ring, food-group coverage chart, suitable vs. avoided allergen lists, copyable summary, and print/PDF stylesheet.
- **Safety, Tests & CI**: Fail-closed custom allergy handling, `localStorage` schema validation, Vitest unit + end-to-end UI flow test suites, GitHub Actions CI/Pages workflows, and project documentation.
