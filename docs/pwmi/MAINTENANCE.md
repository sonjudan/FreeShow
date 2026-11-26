# Maintaining the FreeShow PWMI fork

Keep `main` as the upstream reference and `codex/pwmi` as the team's tested custom branch. Make **codex/pwmi the fork's default branch** so its scheduled workflow is active. Enable Actions in the fork. In Settings → Actions → General, permit GitHub Actions to create pull requests for this repository; the release checker needs this to propose upgrades.

## New upstream releases

**Check upstream FreeShow releases** runs daily and can be run manually. It fetches the latest non-prerelease release from ChurchApps/FreeShow, merges its tag into a temporary `codex/upstream-vX.Y.Z` branch, and opens an upgrade pull request. No auto-merge or installation occurs. It dispatches **PWMI checks** explicitly because PRs created with `GITHUB_TOKEN` do not automatically trigger PR workflows.

If a merge conflicts, it aborts the merge, leaves the custom branch untouched, and opens a conflict-resolution issue rather than committing conflict markers. Follow these steps locally:

```
git switch codex/pwmi
git pull origin codex/pwmi
git remote add upstream https://github.com/ChurchApps/FreeShow.git # once only
git fetch upstream --tags
git switch -c codex/upstream-vX.Y.Z
git merge vX.Y.Z
# Resolve conflicts, then git add the resolved files and git commit.
```

Update `.pwmi/upstream.json` to the new tag; retain its `branch` and increment `customRevision` if rebuilding the same upstream version. Open a PR into `codex/pwmi`.

## Upgrade checklist

- Keep `pwmiNextGroupCue.ts` and its tests. Check parent/child layout and disabled-slide semantics against the new upstream version.
- Keep the opt-in dynamic field in `showActions.ts` and whole-badge visibility in `Textbox.svelte`. The existing upcoming-group field must remain unchanged.
- Keep the PWMI automatic-updater guard in `src/electron/utils/updater.ts` and the custom product name/metadata in the builder config.
- Keep the GPL-3.0 license and upstream notices. Distribute the corresponding fork source alongside binaries, by linking the exact commit used in the build.
- Run PWMI tests, compile the frontend and Electron sources, then run **Build PWMI installers**. Check every requested platform artifact exists.
- Manually rehearse 2-slide and 3-slide groups, single-slide groups, the final group, repeated sections, forward/backward jumps, and a text box with its red background. Verify output previews and stage output if used.
- After review, merge the PR and build from `codex/pwmi`. Share tested installers; never replace a working service computer with an untested CI artifact.

Upstream changes may still need manual conflict resolution. The workflow detects/releases new versions and proposes merges; it cannot guarantee every future release will merge without changes or that every native dependency will build on future runners. If no upstream update is needed, the daily job exits without installing dependencies or building anything.
