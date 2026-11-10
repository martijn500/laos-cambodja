---
status: accepted
date: 2026-11-10
---

# Beslissingen vastleggen met MADR

## Context en probleem

Bij de modernisering zijn veel keuzes gemaakt waarvan het waarom niet uit de code blijkt (waarom geen Lighthouse CI, waarom twee TypeScript-pakketten). Zonder vastlegging draait een volgende ontwikkelaar of AI ze terug, of moet alles opnieuw worden uitgezocht.

## Overwogen opties

- Uitleg in commitberichten alleen
- Eén groot ontwerpdocument
- Architecture Decision Records in MADR-formaat

## Keuze

**MADR 4** in `docs/decisions/NNNN-titel.md`: per beslissing een kort bestand met context, opties, keuze, gevolgen en bronnen. Commitberichten vertellen wát er per stap veranderde; een ADR vertelt waarom, los van wanneer.

### Gevolgen

- Goed: een beslissing is vindbaar op onderwerp, met de alternatieven die afvielen.
- Goed: een AI-agent kan ze lezen voordat hij iets "verbetert" dat bewust zo is.
- Minder goed: bij een nieuwe keuze moet iemand eraan denken een ADR te schrijven; de skill `commit-workflow` herinnert eraan.

## Meer informatie

- [MADR](https://github.com/criscola/madr), [voorbeeld-ADR 0000 van MADR zelf](https://devdocs.jabref.org/decisions/0000-use-markdown-architectural-decision-records.html)
