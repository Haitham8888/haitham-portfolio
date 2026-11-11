# haitham.sys — haithamhattan.sa

Personal site of **Al-Haitham** — AI Engineer & Full-Stack Software Engineer.

**All rights reserved.** The design, code and ASCII artwork are original work and may not be copied or reused. See [LICENSE](LICENSE).

One column, pure black by default (light theme optional), Arabic · English · 中文.
Hand-built, no frameworks, no build step — served as-is by GitHub Pages.

```
index.html        page skeleton + SEO
css/site.css      design tokens (dark + light), layout, responsive rules
js/content.js     every word on the site, in ar / en / zh — edit here
js/eyes-data.js   the eye strip as a brightness grid only — no photo is published
js/ascii.js       eye strip renderer (binary hover lens), name decode, footer signature
js/app.js         rendering, language + theme switching, product previews, interactions
img/              product screenshots (img/products), gallery photos, social card (og.png), CV
fonts/            self-hosted JetBrains Mono + Cairo
```

**Update content:** edit `js/content.js` (achievements, products, projects, awards…), then bump the `?v=` numbers in `index.html` so browsers fetch the new files.

