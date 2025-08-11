# Accessibility testing

- npm run a11y:dev – starts a local server and audits all pages in both light and dark modes and every interactive state.
- Reports are written to:
  - playwright-report/ (HTML)
  - a11y-report.json (machine-readable summary)
- WCAG 2.1 AA contrast thresholds enforced via axe-core:
  - 4.5:1 for normal text
  - 3:1 for large text

Recommendation

Designers and engineers: please run the accessibility audit before every pull request to catch issues early and keep our UI compliant.

