# Fleet sweep checklist (per host upgrade)

## Inputs

- Target host version + its corridor cards (`plugin-upgrade/references/v<target>.md`).
- Fleet repositories with a working build/test toolchain and their mirror
  push scripts, if any (`sync-mirrors.mjs` below is the name used in the
  author's own plugin repositories, not a DSH or skill-provided tool).
- The upgraded host reachable (GUI URL) and the diagnosis toolchain from
  `plugin-runtime-debug/references/browser-forensics.md` (session cookie,
  CDP driver, temporary bundle instrumentation).

## 1. Static sweep (per corridor card)

- Grep every plugin `src/` for the card's renamed/removed identifiers
  (example, 0.1.7-alpha.1: `Icon[A-Za-z]+16`, `workspaceFiles.read`,
  `readAll(`, plus anything the cards mark removed).
- Record hits as broken-until-fixed with file:line; no hits means nothing
  more than "not statically broken".

## 2. Live sweep (driven browser)

For each plugin, assert in this order and record each result separately:

1. `style[data-plugin="<package name>"]` present - the client bundle loaded
   and injected its styles (logic-only plugins legitimately have zero).
2. Console capture over the whole load: no `slot entry crashed in '…'`, no
   React #130, no unhandled exceptions. Slot crashes unmount the WHOLE slot
   entry, so a plugin's surface disappears while only one console line
   remains.
3. The surface's DOM marker present (`data-*` attribute or stable class)
   in the state where the surface is supposed to render - open a session
   first for session-scoped surfaces.
4. The surface's expected network requests fired (e.g. `workspaceFiles/stat`
   after opening a preview).
5. Interaction-gated surfaces: simulate the trigger or mark the verdict
   "interaction path not exercised". Never report an unexercised plugin as
   "working".

## 3. Per-plugin fix loop

- Diagnose against the host source at the target tag (not from names).
- Prefer host-generation-compatible fixes (runtime fallback chains over
  static imports of renamed exports); extend test mocks with every
  fallback name.
- typecheck → tests → build → hard-refresh the GUI → repeat the live
  assertions for the fixed surface.

## 4. Release loop (per plugin)

- Version bump + changelog/compatibility-table row naming the exact host
  version range and the verification evidence.
- Commit (fix + rebuilt lib artifacts), tag `vX.Y.Z`, run the repository's
  mirror script (e.g. the author-specific `sync-mirrors.mjs`; all mirrors, HEAD + tags), then confirm each remote
  carries the tag and its flavored HEAD.
- Rebuild-order pitfall: bump the version BEFORE the release build, or the
  bundle embeds the old version and the update chip advertises an update to
  the version the user already runs.

### 4a. Batching a release wave across repositories (2026-09-25 fleet practice)

One release unit per repository, always in this order — the unit is
per-plugin, batching only sequences the units, it never merges them into a
fleet commit:

1. Verification trio (typecheck → tests → build), then a minor version bump.
2. One release commit in that repository's own release-commit style —
   prebuilt `lib/` plus `locale/` and `tests/` where the repository carries
   them. **Exclude** environmental lockfile/workspace-residue hunks (pnpm 12
   rewrites on this machine) unless the wave's diff contains a real
   dependency change for that repository; they are not release content.
3. Push, then npm publish with an explicit
   `--registry https://registry.npmjs.org/` (auth walls and handling: the
   `plugin-release` skill's publish-playbook, recipe R-14).

**Decouple the git side from the npm side.** When npm hits a token or OTP
wall mid-wave, finish every remaining git side (commit + push), mark the
repository "npm pending" in the wave ledger, and batch-publish when an auth
window opens — one shell loop over the pending list is enough. Never block
the wave's git progress on the registry (first-hand fleet evidence
2026-09-25: a wave pushed all repositories with npm marked pending, then
cleared the backlog in one post-auth loop).

**Pre-existing baseline failures do not stop the unit.** When a
repository's tests fail for reasons that predate the wave, stash the wave's
changes, re-run to prove the failure is not a regression, then release with
the failure noted in the release record (first-hand fleet evidence
2026-09-25: six failures in one repository traced to a drifted dsh source
checkout, ten in another to win32 platform assumptions in upstream tests —
both passed on that evidence).

## 5. Residue

- Every temporary bundle instrumentation is reverted (grep the install tree
  for the debug marker); backups deleted.
- Hot-fixes living in the install tree are listed with their reapplication
  material - the next host upgrade overwrites them.
- Upstream reports updated with anything that turned out to be a host bug.
