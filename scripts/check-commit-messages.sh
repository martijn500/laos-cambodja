#!/usr/bin/env bash
# Checks that every commit in a range has a Conventional Commits subject:
#   type(optional scope): what changed
# Used by CI on pull requests:  scripts/check-commit-messages.sh origin/main..HEAD
set -euo pipefail

range=${1:?usage: $0 <base>..<head>}
types="feat|fix|perf|refactor|style|test|docs|build|ci|chore|security|revert"
pattern="^($types)(\([a-z0-9-]+\))?!?: .+"
status=0

while IFS= read -r line; do
  hash=${line%% *}
  subject=${line#* }
  # Merge commits are made by GitHub, not written by hand
  [[ $subject == Merge\ * ]] && continue
  if [[ ! $subject =~ $pattern ]]; then
    echo "✗ $hash \"$subject\""
    status=1
  fi
done < <(git log --format='%h %s' "$range")

if ((status)); then
  echo
  echo "Gebruik <type>: <wat er verandert>, met type één van: ${types//|/, }"
  echo "Bijvoorbeeld: fix: popup blijft open na snel klikken"
fi
exit $status
