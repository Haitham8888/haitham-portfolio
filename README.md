# haitham.sys — haithamhattan.sa

Personal site of **Haitham Hattan** — AI Engineer & Full-Stack Software Engineer.

ASCII / terminal identity, dark by default with an optional light theme, Arabic · English · 中文.
Hand-built, no frameworks, no build step — served as-is by GitHub Pages.

```
index.html        page skeleton + SEO
css/site.css      design system (dark + light tokens), layout, responsive rules
js/content.js     every word on the site, in ar / en / zh — edit here
js/ascii.js       ASCII engine: live portrait, photo → ASCII, hero field, 0/1 banners, scramble
js/app.js         rendering, language + theme switching, ⌘K command palette, interactions
img/              photos, product screenshots (img/products), CV
fonts/            self-hosted JetBrains Mono + Cairo
```

**Update content:** edit `js/content.js` (achievements, products, projects, awards…), then bump the `?v=` numbers in `index.html` so browsers fetch the new files.

**Keyboard:** `Ctrl/⌘ + K` or `/` opens the command palette.
