# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Rishabh Doshi's portfolio at rishabhdoshi.com. Static, no build step, deployed by Cloudflare (Workers static assets) on push to `main`. `README.md` explains the split in detail; `docs/versions.md` covers the version history. Author commits as `doshi-experiments <311927837+doshi-experiments@users.noreply.github.com>`.

## Never publish PII or sensitive information

Nothing personal or sensitive goes to GitHub, under any circumstances, without Rishabh's direct approval of that specific content. That covers files, commit messages, branch names, pull requests, issues, comments, release notes, screenshots and test fixtures, and it applies even while a repository is private: every repository on this account is public or will be.

- Personal data: names other than Rishabh's public name (household members, pets, friends), email addresses, phone numbers, home addresses, the city or neighbourhood the household lives in, dates of birth, health or care providers.
- Financial data: account or card numbers, balances, real transactions, statements, payees and merchant strings, amounts and dates from real data, which banks or cards are held, anything from bank exports or Actual Budget.
- Secrets and infrastructure: `.env` contents, API keys, tokens, passwords, private hostnames and IP addresses, Tailscale names, Home Assistant entity names and user ids, chat ids.
- Anything copied from a real export, inbox, database or log. A file named "example" or "sample" must be invented, not trimmed from real data.

Commit identity: author and commit only as `doshi-experiments <311927837+doshi-experiments@users.noreply.github.com>`. Run `git config user.email` before the first commit in any checkout, and never put a personal address in a `Co-authored-by` trailer.

Commit messages and pull request text are as public as the code. Describe what changed and why, not the real data that prompted it: no real merchants, amounts, transaction dates, account names or people, even as examples.

Use synthetic fixtures instead. Before every commit and push, check the staged diff, any new untracked files and the message itself for this kind of content. If something looks sensitive, or you are unsure, stop and ask; do not commit it, push it or open a pull request with it. Earlier approval of a different change does not cover this one. Git history is permanent: a leak can only be removed by rewriting history and recreating the repository.

## Commands

```sh
python3 -m http.server 8788        # ES modules and the iframe need HTTP, not file://
node tools/check-links.mjs         # every local reference resolves; archives stay self-contained
```

CI also re-verifies the SHA-256 hashes of every `design-system/release.json` (the live snapshot and each archive's).

## Architecture

- The home page and the first three case studies (`/shipment/`, `/genai/`, `/healthcare/`) are a **split**: Face A is a same-origin iframe of the frozen 2025 Framer archive (`versions/2025-framer/`), Face B is the same page re-made in Felt, clipped by `clip-path` from a registered `--split` property. `split.js` runs it: the draggable `role="separator"` knob, the viewport-unit shim for the archive, link rerouting to the top window, and the position saved in `localStorage` under `split-portfolio` (applied before first paint by an inline script). `portfolio.js` runs the Felt face of the home page.
- `/household/` (Case 04, the household apps) is felt only, with no split and no 2025 twin. `household/household.css` and `household.js` hold its own pieces: the sticky chapter bar (`[data-ch]` sections with `data-num` and `data-title`), the contents, the map views and bear switch, the `<dialog>` viewer for the two recordings, and the reduced-motion handling. Its assets live beside it and total about 3 MB; keep them there, not at the root.
- `portfolio.css` styles the Felt faces. These pages do **not** load the design system; they mirror its signal tokens: `--sig`, `--sig-grad`, `--on-sig`, `--sig-tint`, `--focus`. Change them together with any design-system signal change. Inside the charcoal preview screens `--sig` is the dark-mode red `#E89D9C`.
- `/versions/` is the version timeline and the only page here that loads the design system, from the committed snapshot in `design-system/`. Each `versions/<release>/` is a frozen archive with its own snapshot.

## Invariants that are easy to break

- Never edit archive files under `versions/` or any `design-system/` snapshot by hand; CI checks the hashes and `check-links` checks archive links.
- `.assetsignore` is an allow-list. New top-level files are not deployed unless listed; repository files such as `README.md` and this file stay private.
- The 2025 face keeps its own coral `#FF5E7C`; only the Felt face follows the design system's signal.
- Focus rings use `--focus` (`#A22826`, at least 3:1 on oat), never the bright signal.
- Site-owned content opens in the same tab. Only external profiles open new tabs, and say so.
- Copy follows the design system's `docs/identity.md`. Every claim on the first three case studies must trace to the 2025 originals; every number on `/household/` traces to those apps' READMEs, change logs or databases (counts only, never amounts or real records). Never invent clients, outcomes or numbers.
- `/household/` names the two dogs and shows the house's floor plan with Rishabh's approval. Any new personal detail there needs his approval again. The people in its chat and recordings are invented; keep them that way.
