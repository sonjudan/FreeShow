# FreeShow PWMI edition

Based on FreeShow **1.6.7**, licensed under GPL-3.0. This fork keeps the upstream copyright and license. The customization is opt-in; normal FreeShow templates and the existing PWMI/Ableton bridge continue to work.

## Last-slide next-section badge

In your FreeShow template, edit the text box that contains the upcoming section and replace its text with:

```
{slide_group_upcoming_last}
```

You can include a prefix, e.g. `Next: {slide_group_upcoming_last}`. Set the red background on **this same text box**, not on a separate rectangle. The complete box is hidden on earlier slides of a group, shown on the last slide when another group follows, and hidden at the end of the song. It remains visible while editing a template.

| Current position | Badge |
| --- | --- |
| Verse 1, first slide | Hidden |
| Verse 1, second slide | Hidden |
| Verse 1, third/last slide | Next group name |
| Pre-Chorus, first slide | Hidden |
| Pre-Chorus, second/last slide | Next group name |
| Last group of song, final slide | Hidden |

With the updated PWMI bridge, `{slide_group_upcoming_last}` follows Ableton’s SECTIONS order, including repeat/backward jumps. PWMI supplies an empty badge while the next contiguous clip continues the same group (`Verse 1 / 2`, `/ 3`), and the next section name on the final cue. Both apps must be updated to PWMI revision 5. The live badge appears in the final two seconds before the next Ableton section and hides at that section boundary; thumbnails/template editing retain their previews. A plain Ableton `Verse` uses FreeShow’s `Verse 1` only if no `Verse` group exists. Without PWMI cue metadata (e.g. manually selecting slides), it falls back to FreeShow arrangement order.

The existing `{slide_group_upcoming}` field is unchanged. Manual advancement, Ableton exact-slide commands, repeats, and backward jumps all recompute the result from FreeShow's current slide. Manual slides follow FreeShow arrangement order. Repeated parent groups count as separate sections; child slides belong inside their parent group.

## Share with multimedia

1. Open this repository's **Actions → Build PWMI installers → Run workflow**, choosing the `codex/pwmi` branch.
2. Wait for the Windows, Apple Silicon Mac and Intel Mac jobs to succeed.
3. Download the matching artifact, unzip it, and share the installer with the team. Artifacts expire after 30 days; keep tested installers in your shared team folder or attach them to a GitHub Release.
4. Back up the team's FreeShow library before the first install. The custom application is named **FreeShow PWMI** with a separate application ID. Do not run both apps against a shared writable library at the same time. Connect the custom app to the same ChurchApps team or import the backed-up library; confirm shows, outputs and API settings before a service.
5. Set up the last-slide field in the template and rehearse on the actual output. Save/close the official app before switching.

These builds are **unsigned / not Apple-notarized**. OS security prompts may appear. They do not impersonate ChurchApps' signed official releases. The custom app disables the upstream automatic updater so an official update cannot silently replace the feature. Install tested PWMI updates explicitly.

PWMI Stage View/Band View code is a separate project and is not changed by this fork.

## Development

```
npm ci
npx vitest run --config config/testing/vitest.config.ts src/frontend/utils/pwmiNextGroupCue.test.ts
npm run build
npx electron-builder --config config/building/electron-builder.pwmi.cjs --mac --arm64 --publish never
```

On Windows use `--win --x64`; for Intel Mac use `--mac --x64`. Full packaging requires the platform's native build tools. CI uses the same locked dependencies and build steps. See [MAINTENANCE.md](MAINTENANCE.md) for upstream releases.

Revision 5 timing: in Auto, the live badge is empty until the final two seconds before the next Ableton section. It stays visible until the transport crosses that boundary, then hides. This uses raw transport beats and current tempo, independently of lyric lead time. The earlier one-second wall-clock timer is removed.
