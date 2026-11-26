#!/usr/bin/env bash
set -euo pipefail
current=$(node -p 'require("./.pwmi/upstream.json").tag')
base=$(node -p 'require("./.pwmi/upstream.json").branch')
tag=$(gh api repos/ChurchApps/FreeShow/releases/latest --jq .tag_name)
[[ "$tag" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "Not a stable version: $tag"; exit 1; }
[[ "$tag" != "$current" ]] || { echo "Already based on $tag"; exit 0; }
branch="codex/upstream-${tag}"
existing=$(gh pr list --state open --head "$branch" --base "$base" --json number --jq 'length')
[[ "$existing" == 0 ]] || { echo "An update PR is already open"; exit 0; }
git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git remote get-url upstream >/dev/null 2>&1 || git remote add upstream https://github.com/ChurchApps/FreeShow.git
git fetch upstream "refs/tags/${tag}:refs/tags/pwmi-upstream-${tag}"
git switch -C "$branch"
if ! git merge --no-edit "refs/tags/pwmi-upstream-${tag}"; then
  git merge --abort
  title="PWMI: upstream ${tag} needs conflict resolution"
  count=$(gh issue list --state open --search "$title in:title" --json number --jq 'length')
  if [[ "$count" == 0 ]]; then
    gh issue create --title "$title" --body "The automatic merge of ChurchApps/FreeShow ${tag} into ${base} conflicted. No changes were installed or published. Follow docs/pwmi/MAINTENANCE.md to merge this release locally, preserve the last-slide cue and updater guard, and run the checks before packaging."
  fi
  exit 0
fi
node - "$tag" <<'JS'
const fs = require('node:fs'); const path = '.pwmi/upstream.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8')); data.tag = process.argv[2];
fs.writeFileSync(path, JSON.stringify(data, null, 4) + '\n');
JS
git add .pwmi/upstream.json
git commit -m "Track upstream FreeShow ${tag}"
git push origin "HEAD:refs/heads/${branch}"
gh pr create --base "$base" --head "$branch" --title "Update PWMI edition to FreeShow ${tag}" --body "Merges the latest stable ChurchApps/FreeShow release while retaining the PWMI customization. Run the PWMI checks and test the badge on two- and three-slide groups before merging. After review, run Build PWMI installers from ${base}. This PR does not install or auto-merge anything."
# GITHUB_TOKEN-created PRs do not trigger pull_request workflows automatically.
gh workflow run pwmi-check.yml --ref "$branch"
