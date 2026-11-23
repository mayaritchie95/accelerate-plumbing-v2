# Accelerate Plumbing & Heating — Website

**Live site:** https://accelerate-plumbing.vercel.app

A fast, static marketing site for Accelerate Plumbing & Heating Ltd. (Prince George, BC).
Plain HTML, one shared stylesheet and one vanilla-JavaScript file. No build step, no framework, no dependencies.

## Pages
- `index.html` — Home (hero, services, promises, process, projects slider, reviews, quote form, FAQ)
- `about.html` — About, service standard, work gallery, service area checker, FAQ
- `plumbing.html` — Plumbing services (stacked service cards)
- `heating.html` — Heating & Mechanical (stacked service cards + job photo gallery)
- `contact.html` — Contact + quote request form

## Files
- `styles.css` — all styling. Brand colours are CSS variables at the top (`--navy`, `--blue`, `--red`…).
- `app.js` — sticky header, mobile menu, sliders, scroll effects, area checker and both forms.
- `fonts/` — Red Hat Display (headings) and Roboto (body), self-hosted.

## Forms
The Home and Contact forms check the required fields in the browser, then open a pre-filled email
to **acceleratepandh@gmail.com** (mailto). No server needed.

## Deploy (Vercel)
Static site, so it deploys straight away: import the repo (Framework preset **Other**, no build command,
output directory `.`), or drag the folder onto the Vercel dashboard. `vercel.json` turns on clean URLs.

## Local preview
`python3 -m http.server 8000`, then visit http://localhost:8000
