#!/usr/bin/env bash
# PreToolUse hook (Bash): no git commit or git push on main, or on a branch
# whose pull request is already merged or closed. A commit there never
# reaches main (this happened three times in this project); see the skill
# commit-workflow for how to move such a commit to a fresh branch.
input=$(cat)
command=$(jq -r '.tool_input.command // ""' <<<"$input")
cwd=$(jq -r '.cwd // "."' <<<"$input")

pattern='(^|[[:space:];&|(])git[[:space:]]+(commit|push)([[:space:]]|$)'
[[ $command =~ $pattern ]] || exit 0

deny() {
  jq -n --arg reason "$1" '{hookSpecificOutput: {hookEventName: "PreToolUse",
    permissionDecision: "deny", permissionDecisionReason: $reason}}'
  exit 0
}

branch=$(git -C "$cwd" branch --show-current 2>/dev/null)
[[ -n $branch ]] || exit 0 # detached HEAD or not a repo: not our case
[[ $branch == main ]] && deny "Op main wordt niet gecommit of gepusht: maak een branch vanaf origin/main (skill commit-workflow)."

# Without gh or network we can't tell; don't block the work, git and the
# GitHub ruleset still guard main
state=$(cd "$cwd" && gh pr list --head "$branch" --state all --limit 1 \
  --json state --jq '.[0].state // ""' 2>/dev/null) || exit 0
# (macOS ships bash 3.2: no ${state,,})
case $state in
  MERGED) done="gemerged" ;;
  CLOSED) done="gesloten" ;;
  *) exit 0 ;;
esac
deny "De pull request van '$branch' is al $done: een commit hier komt nooit op main. Maak een nieuwe branch vanaf origin/main en cherry-pick (skill commit-workflow)."
exit 0
