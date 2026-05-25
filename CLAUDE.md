# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hugo static site for lurdev.com — a single-page marketing site. No theme, no package manager, no build pipeline beyond Hugo itself.

## Dev & Build Commands

```bash
hugo server   # local dev server (live reload at localhost:1313)
hugo          # production build → public/
```

Deployment is automatic: push to `main` → Netlify builds with `hugo` and publishes `public/`.

## Hugo Version

Netlify pins Hugo `0.122.0` (`netlify.toml`). Local install is newer. Avoid using Hugo features introduced after `0.122.0` unless you also update the `HUGO_VERSION` in `netlify.toml`.

## Project Structure

- `layouts/index.html` — single homepage template
- `layouts/partials/` — header, footer, head-end (GA injection)
- `static/css/index.css` — all styles (vanilla CSS, no preprocessor)
- `static/js/index.js` — modal contact form + GA event tracking
- `static/js/dragon-scales.js` — animated canvas background
- `assets/images/` — SVG logos (processed by Hugo pipelines)
- `content/` — empty; site has no content pages

## CSS Design Tokens

```css
--main-color: #0f4c81      /* dark blue */
--secondary-color: #f0c244 /* yellow */
```

Use these variables for any new color references.

## Responsive Breakpoints

Defined in `static/css/index.css`: `1440px`, `1000px`, `800px`, `600px`.

## Contact Form

Handled by Formspree (`static/js/index.js`). The endpoint key is committed directly in the JS file — treat it as non-secret (it's a public form handler).
