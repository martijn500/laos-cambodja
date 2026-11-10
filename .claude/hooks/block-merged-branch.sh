#!/usr/bin/env bash
# PreToolUse hook (Bash): no git commit or git push on main, or on a branch
# whose pull request is already merged or closed. A commit there never
# reaches main (this happened three times in this project); see the skill
# commit-workflow for how to move such a commit to a fresh branch.
input=$(cat)
command=$(jq -r '.tool_input.command // ""' <<<"$input")
cwd=$(jq -r '.cwd // "."' <<<"$input")

pattern='(^|[[:space:];&|(])git([[:space:]]+-C[[:space:]]+[^[:space:]]+)?[[:space:]]+(commit|push)([[:space:]]|$)'
[[ $command =~ $pattern ]] || exit 0

# The command may run git somewhere else than the session:
# "cd <dir> && git commit" or "git -C <dir> commit"
target=$cwd
git_dir_pattern='git[[:space:]]+-C[[:space:]]+([^;&|[:space:]]+)'
cd_pattern='(^|[;&|(])[[:space:]]*cd[[:space:]]+([^;&|[:space:]]+)'
if [[ $command =~ $git_dir_pattern ]]; then
  target=${BASH_REMATCH[1]}
elif [[ $command =~ $cd_pattern ]]; then
  target=${BASH_REMATCH[2]}
fi
target=${target//[\"\']/}
target=${target/#\~/$HOME}
[[ $target == /* ]] || target="$cwd/$target"

# These rules are for this project's repo only; a commit in another repo
# (another project's main, for instance) is not ours to judge
project=$(git -C "${CLAUDE_PROJECT_DIR:-$cwd}" rev-parse --show-toplevel 2>/dev/null)
repo=$(git -C "$target" rev-parse --show-toplevel 2>/dev/null)
[[ -n $repo && $repo == "$project" ]] || exit 0
cwd=$target

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
