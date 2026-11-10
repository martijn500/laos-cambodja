# Documentatie

Waar staat wat. De indeling volgt [Diátaxis](https://diataxis.fr): elk document heeft één doel, en soorten worden niet gemengd.

| Je wilt…                                                                                    | Soort (Diátaxis) | Waar                                                                         |
| ------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------- |
| het project draaien en de scripts kennen                                                    | tutorial         | [README.md](../README.md) in de root                                         |
| een taak uitvoeren: dag toevoegen, wijziging controleren, committen, dependencies bijwerken | how-to           | de skills in [.claude/skills/](../.claude/skills/), leesbaar voor mens en AI |
| weten waarom iets zo is gebouwd                                                             | explanation      | [decisions/](decisions/): één beslissing per bestand (MADR)                  |
| feiten en valkuilen opzoeken                                                                | reference        | [reference/gotchas.md](reference/gotchas.md)                                 |
| de bronnen achter de beslissingen                                                           | reference        | [reference/sources.md](reference/sources.md)                                 |
| zien wat er veranderd is                                                                    | reference        | [CHANGELOG.md](../CHANGELOG.md)                                              |
| de afspraken die altijd gelden                                                              | reference        | [AGENTS.md](../AGENTS.md)                                                    |

## Wat waar hoort

- **Een nieuwe keuze** met alternatieven (een library, een aanpak, een afspraak): nieuwe ADR in `decisions/`, volgnummer erbij. Een ADR wordt niet herschreven als de keuze verandert; schrijf een nieuwe en zet de oude op `superseded by`.
- **Een niet-voor-de-hand-liggend feit** dat iemand anders (of een AI) fout zou doen: `reference/gotchas.md`, met hoe je het merkt en wat de oplossing is.
- **Een terugkerende taak** met stappen: een skill (zie [ADR 0012](decisions/0012-agents-md-skills-en-kennisbank.md)).
- **Een regel die altijd geldt**: `AGENTS.md`. Kort houden: alles daarin wordt bij elke taak gelezen.
