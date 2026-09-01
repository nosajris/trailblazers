---
name: issue-tracking
description: Sync GitHub issues to and from issues.csv and post verification guides. Use when asked to pull/refresh issues, mark an issue fixed or "need testing", change issue labels, write a verification guide, decide what to work on next from the backlog, or run scripts/github-sync.ts. Triggers on "issues.csv", "issue guide", "need testing", "github-sync", "what should we work on".
---

# Issue tracking (issues.csv + issue-guides/)

> **Not set up in this checkout.** None of `issues.csv`, `issue-guides/`,
> `scripts/github-sync.ts` or `GITHUB_TOKEN` exists here yet, so the commands
> below will fail. Until someone adds them, work issues directly on GitHub and
> follow the *rules* in this file — claim before starting, `need testing` means
> pushed and testable, never use a closing keyword in a commit. Do not invent
> the missing files to make a command run.

`issues.csv` is a local mirror of the repo's **open** GitHub issues.
`scripts/github-sync.ts` moves data both ways. `issue-guides/<number>.md` holds
the verification steps posted as a comment when an issue is marked for testing.

Auth comes from `GITHUB_TOKEN` in `.env` (once configured — never ask for it,
never print it).

## The two commands

```bash
npx tsx scripts/github-sync.ts pull              # GitHub -> issues.csv (read-only, safe)
npx tsx scripts/github-sync.ts push --dry-run    # show what would change
npx tsx scripts/github-sync.ts push              # issues.csv -> GitHub (writes!)
```

Options: `--state=open|closed|all` (pull, default `open`), `--file=<path>`,
`--no-comments` (push labels/state but post no guides).

Only **labels** and **state** are pushed. Editing a title or body in the CSV does
nothing — `diffIssues` ignores read-only fields, and issues present locally but
not on GitHub are skipped (the CSV cannot create issues).

## CRITICAL: pull overwrites the whole file

`pull` rewrites `issues.csv` from GitHub, discarding any local edit that has not
been pushed. **Always capture pending work before pulling:**

```bash
npx tsx scripts/github-sync.ts push --dry-run    # record what is pending
npx tsx scripts/github-sync.ts pull
# then reapply those label changes to the fresh file
```

Reapply by editing the `labels` cell. Preserve the existing labels and add to
them; do not overwrite the set, or you will silently drop labels someone changed
on GitHub in the meantime.

## Marking an issue fixed

The convention is that a fixed-but-unverified issue keeps its `bug` /
`high priority` labels and gains **`need testing`**. Insert it after
`high priority` to match the existing ordering. It is not closed — a human
verifies and closes it.

**`need testing` means the fix is pushed and testable, not merely committed.**
A local commit does not qualify — the team removes the label when the code
behind it was never pushed, because a tester who picks it up finds nothing
changed. Check `git log origin/<branch>..HEAD` before applying it, and hold the
label on anything still sitting in unpushed commits.

Once it genuinely qualifies:

1. `pull` first, so you are editing current data.
2. Add `need testing` to the issue's `labels` cell.
3. Write `issue-guides/<number>.md` if the issue does not have one.
4. `push --dry-run`, confirm the diff is exactly what you intend.
5. **Ask the user before running `push`.** It writes to real client-visible
   issues and @-mentions real people. Never push unprompted.

## Claiming work

**Check the assignee before starting an issue.**

- **Assigned to someone else → skip it.** They are likely already on it; that is
  the double-work this convention exists to prevent. Say so and pick another.
- **Unassigned → claim it before starting**, so nobody duplicates the effort.
- Assign the person actually doing the work, at the point work begins — not
  retroactively across the backlog.

Assignees are **not** synced: `diffIssues` only compares `state` and `labels`,
so the CSV's `assignees` column is read-only and a pull will not reflect a
claim you only made locally. Assign through the API:

```
POST /repos/{repo}/issues/{n}/assignees   {"assignees": ["<login>"]}
```

That endpoint **adds** rather than replaces, so it never displaces an existing
assignee. Read the issue first and skip if `assignees` is already non-empty.
When proposing what to work on, report who holds each issue and exclude the
ones already taken.


## Linking commits and PRs to issues

Every commit that changes behaviour should name its issue, so the work shows up
on the issue timeline and in the PR that carries it.

```
fix(events): save the banner uploaded during initial event creation (#198)
```

**Do not use GitHub's closing keywords.** `fixes #198`, `closes #198`,
`resolves #198` (and the `-es`/`-ed` variants) auto-close the issue the moment
the PR merges into the default branch. That bypasses `need testing` entirely —
the fix would never be verified, and the issue would vanish from the board while
still unconfirmed. Use a bare `(#198)`, or `Refs #198` in the body.

`fix(scope):` as a conventional-commit type is safe. A keyword only closes when
it sits directly before the reference, so `fix(events): … (#198)` links without
closing, while `fix #198` would close.

For a PR description, list the issues the same way — `Refs #197, #198, #203` —
so they are all linked, then let a human close each one after verifying it.

If the work is user-visible and has no issue yet, file one first (see *Filing a
new issue*) so there is something to verify against. Chores and internal
refactors do not need one; several of this repo's own tooling commits
legitimately have no reference.

## Filing a new issue

**The CSV cannot create issues** — `diffIssues` skips anything present locally
but not on GitHub, so adding a row does nothing. Use the API:
`POST /repos/{repo}/issues` with `title`, `body`, `labels`.

Search before filing, including **closed** issues
(`pull --state=all --file=/tmp/all.csv`) — the work may already be tracked.

Match the board's existing shape: `**Description**`, `**Actual Result**`,
`**Expected Result**`, then numbered verification steps. If the work was
requested over chat rather than raised on GitHub, quote the request so the
origin is not lost. Work shipped without an issue never reaches UAT or the
release notes.

## Verification guides

One file per issue: `issue-guides/<number>.md`. See `issue-guides/README.md`.

- Read from disk **at push time**, so a `pull` can never clobber one and writing
  a guide never requires a code change.
- `{{creator}}` expands to an @mention of whoever opened the issue.
- **No file means no comment** — that is the correct default, since the label
  already says "verify me". Never add a generic placeholder guide.
- Each posted guide carries a hidden `<!-- kura-guide:<n> v1 -->` marker and is
  skipped if already present, so re-pushing a label will not duplicate it.
- To post a **revised** guide, bump `GUIDE_MARKER_VERSION` in
  `packages/core/src/utils/github-sync.ts`.

Write for someone who has not read the code: name the screen, the steps, and
what a correct result looks like. Always state any precondition that decides
whether the bug reproduces — the #197 guide says to create a *new* event,
because an existing one never triggered the crash.

## Reading the CSV correctly

Cells are quoted and **descriptions span multiple lines**, so the file has far
more physical lines than issues. Never parse it line-by-line:

```bash
python3 -c "
import csv
rows=list(csv.DictReader(open('issues.csv', newline='')))   # newline='' matters
print(len(rows))
"
```

Columns: `number,type,title,state,labels,url,created_at,updated_at,assignees,description,creator`.

## Prioritising work

When asked what to work on, read the labels rather than guessing:

1. **Exclude anything already assigned to someone else** (see *Claiming work*),
   and say who holds it rather than silently dropping it.
2. **`need testing` items are not engineering work** — they are fixed and
   waiting on a human. Report them separately; do not "fix" them again.
3. `AGCC UAT` marks a client actively testing, which carries deadline pressure
   the rest of the backlog does not.
4. Treat `high priority` sceptically. It is applied broadly — a cosmetic issue
   can carry the same label as a crash. Rank by actual severity: crashes and
   data loss above cosmetic defects.
5. Before proposing a fix, confirm the bug is real by reading the code. Several
   "does not save" reports turned out to be distinct root causes, not one.
