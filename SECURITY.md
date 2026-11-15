# Security Policy

## Architecture & Data Privacy

AHARWISE is a **100% client-side** React application:
- No user accounts, backend databases, or external API keys are used.
- Household profiles and food screening logs are stored strictly in the user's browser `localStorage` (`aharwiseProfile` and `aharwiseScreening`) and validated against strict runtime schema guards in `src/lib/storage.ts`.
- Allergen filtering is enforced across all suggestion surfaces and fails closed when unclassified free-text allergies (`otherAllergies`) are entered.

## Supported Versions

| Version | Supported |
| --- | --- |
| `1.0.x` | Yes |

## Reporting a Vulnerability

If you discover a security vulnerability, XSS vector, allergen-filtering bypass, or dependency issue:

1. **Do not** open a public GitHub issue for sensitive vulnerabilities.
2. Report it privately via GitHub Security Advisories (**Security → Advisories → New draft security advisory**) or email the maintainers at `[INSERT SECURITY CONTACT EMAIL]`.
3. Include steps to reproduce, affected files/routes, and potential impact.

We aim to acknowledge reports within **48 hours** and release a fix or mitigation guidance promptly.
