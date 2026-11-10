---
status: accepted
date: 2026-11-10
---

# Beveiliging: CSP met Trusted Types en een strenge installatie

## Context en probleem

Een statische site lijkt weinig aanvalsoppervlak te hebben, maar elke dependency draait in de browser van bezoekers, en elke `npm install` kan code van derden uitvoeren. In 2025–2026 waren er meerdere grote npm-supply-chain-aanvallen.

## Keuze

**In de browser**: een Content-Security-Policy als `<meta>`-tag (GitHub Pages kan geen headers sturen), alleen in de build (de dev-server injecteert inline scripts). Alles van de eigen origin, plus OpenFreeMap voor de kaart. Trusted Types verplicht; een `default`-policy laat precies één script-URL toe: de worker van MapLibre (`src/map/map.ts`). De e2e-tests falen op CSP-meldingen in de console.

**Bij installeren** (`.npmrc`): `min-release-age=7` (alleen versies die een week oud zijn), `ignore-scripts=true`, `engine-strict=true`. Dependabot met dezelfde wachttijd. GitHub Actions vastgezet op commit-SHA, met de versie als commentaar.

### Gevolgen

- Goed: een kwaadaardige release die binnen een week wordt ontdekt, komt hier niet binnen.
- Goed: als een dependency ooit `innerHTML` gaat gebruiken, faalt een test.
- Minder goed: een patch die je dringend wilt, moet je soms een paar dagen laten liggen (Playwright 1.65 werd zo tegengehouden).
- `<meta>`-CSP kent geen `frame-ancestors` en geen report-only.

## Meer informatie

- [npm-beveiliging](https://github.com/lirantal/npm-security-best-practices), [lessen uit de incidenten van voorjaar 2026](https://dev.to/trknhr/lessons-from-the-spring-2026-oss-incidents-hardening-npm-pnpm-and-github-actions-against-1jnp)
- [Trusted Types (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/trusted-types), [CSP via meta-tag](https://dev.to/jacobandrewsky/how-to-set-content-security-policy-with-a-meta-tag-5gfm)
- Commits `9caf202`, `9216828`, `d2b52fd`
