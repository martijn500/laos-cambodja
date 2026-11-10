---
status: accepted
date: 2026-11-10
---

# Afspraken voor mens en AI: AGENTS.md, skills en deze kennisbank

## Context en probleem

Het project wordt grotendeels samen met AI-agents gebouwd. Afspraken die in een gesprek zijn gemaakt (losse commits per stap, tests naast de bron, `.ts`, nooit direct op `main`) zijn weg bij het volgende gesprek. Kennis die met moeite is gevonden (waarom de MapLibre-worker een policy nodig heeft) moet niet opnieuw worden uitgezocht.

## Overwogen opties

- Alles in `CLAUDE.md`
- `AGENTS.md` voor de vaste regels, Agent Skills voor taken, `docs/` voor achtergrond

## Keuze

Drie lagen, elk met een open standaard:

1. **`AGENTS.md`** (open standaard, beheerd door de Agentic AI Foundation onder de Linux Foundation): korte, altijd geldende regels en commando's. Wordt gelezen door Codex, Cursor, Copilot en anderen, en sinds versie 2.1.277 ook door Claude Code als er geen `CLAUDE.md` is. Er is daarom bewust geen `CLAUDE.md`.
2. **Skills** in `.claude/skills/<naam>/SKILL.md` (Agent Skills-standaard, agentskills.io): één taak per skill, een `description` die zegt wat en wanneer (die laadt de agent altijd; de rest pas als de taak speelt), SKILL.md kort, valkuilen in SKILL.md zelf, scripts ernaast.
3. **`docs/`** volgens Diátaxis: `decisions/` (waarom), `reference/` (feiten, valkuilen, bronnen); how-to's zijn de skills; de tutorial is de README.

### Gevolgen

- Goed: tool-onafhankelijk; een mens leest dezelfde bestanden als de AI.
- Goed: de context van een agent blijft klein: alleen de beschrijvingen van skills zijn altijd geladen.
- Minder goed: bijhouden kost discipline; de skill `commit-workflow` vraagt bij elke wijziging of changelog, ADR of gotchas moeten worden bijgewerkt.

## Meer informatie

- [AGENTS.md](https://agents.md/), [Claude Code ondersteunt AGENTS.md (The Register)](https://www.theregister.com/ai-and-ml/2026/09/18/anthropic-decides-to-support-openais-markdown-instructions-spec/5297588)
- [Agent Skills: best practices](https://agentskills.io/skill-creation/best-practices), [Claude: skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Diátaxis](https://diataxis.fr), [MADR](https://github.com/criscola/madr)
