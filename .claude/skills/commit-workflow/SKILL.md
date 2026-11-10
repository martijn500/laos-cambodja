---
name: commit-workflow
description: Branch, commit, document and open a pull request in the laos-cambodja repo. Use when starting a change, before committing, when the user asks to commit, push, open a PR, update the changelog, or "vastleggen". Covers branch checks (never main, never a merged branch), Conventional Commits, CHANGELOG/ADR/gotchas updates and the PR via gh.
---

# Commit-workflow

## 1. Begin op een verse branch

```sh
git fetch origin
git switch -c <type>/<onderwerp> origin/main   # bv. fix/popup-snel-klikken
```

Werk je verder op een bestaande branch, controleer dan eerst dat hij **niet al gemerged is**:

```sh
git branch -r --merged origin/main | grep "origin/$(git branch --show-current)$" && echo "GEMERGED: nieuwe branch maken"
```

Commits op een gemergede branch komen nooit op `main`. Zijn er al zulke commits: nieuwe branch vanaf `origin/main`, `git cherry-pick <commits>`, oude branch terugzetten met `git branch -f <naam> origin/<naam>`.

## 2. Per logische stap één commit

1. Doe één ding (een upgrade, een refactor, een fix).
2. `npm run check` moet groen zijn. Bij CSS of layout ook `npm run compare` (skill `verify-change`).
3. Commit in het Engels:

   ```
   <type>: <wat er verandert, gebiedende wijs, ≤ 72 tekens>

   Why it was needed and how it was checked (numbers, test names).

   Co-Authored-By: …   (als een AI meeschreef)
   ```

   Types: `feat fix perf refactor style test docs build ci chore security revert`. CI controleert dit per PR (`scripts/check-commit-messages.sh origin/main..HEAD`).

Commit niet "tussendoor" iets dat rood is; maak de stap kleiner.

## 3. Documentatie in dezelfde PR

Loop dit na bij elke PR:

| Vraag                                       | Zo ja                                                                                                                                                                                                                                                                                  |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merkt een bezoeker of ontwikkelaar het?     | Regel in `CHANGELOG.md` onder **Onuitgebracht**, in de juiste sectie (`feat` → Toegevoegd, `perf`/`refactor`/`build`/`style` → Gewijzigd, `fix` → Opgelost, `security` → Beveiliging, weggehaald → Verwijderd), met de commit-hash. Schrijf voor de lezer, kopieer geen commitbericht. |
| Is er gekozen tussen alternatieven?         | Nieuwe ADR: kopieer de opzet van een bestaande in `docs/decisions/`, volgend nummer. Vervangt hij een oude, zet die op `status: superseded by NNNN`.                                                                                                                                   |
| Ging er iets mis dat niet voor de hand lag? | Valkuil in `docs/reference/gotchas.md`: hoe je het merkt en de oplossing.                                                                                                                                                                                                              |
| Is er iets opgezocht?                       | Bron met conclusie in `docs/reference/sources.md`.                                                                                                                                                                                                                                     |
| Nieuwe vaste afspraak met de gebruiker?     | `AGENTS.md` (kort) of de passende skill.                                                                                                                                                                                                                                               |

## 4. Pull request

```sh
git push -u origin HEAD
gh pr create --fill --base main
```

`gh` moet ingelogd zijn (`gh auth status`; anders laat de gebruiker `gh auth login` zelf draaien, dat gaat via de browser). Zet in de beschrijving wat er verandert, hoe het gecontroleerd is, en wat de gebruiker nog moet doen.

Kan de PR niet gemerged worden omdat hij achterloopt op `main` (de ruleset eist dat), dan `gh pr update-branch <nr>` en CI opnieuw afwachten (`gh pr checks <nr> --watch`).

Na de merge: `git switch main && git pull --ff-only`, en voor het volgende werk een nieuwe branch. **Nooit** zelf naar `main` pushen of force-pushen.
