# qontic-dev Migration Guide

This project is now synced so `qontic-dev/main` matches `qontic/main` at commit `79b5259`.

## Goal

Use `qontic-dev` as the day-to-day development repository.

## One-time setup (Anssi and Mark)

If they already cloned `qontic`:

```bash
# From existing local clone
git remote rename origin upstream
git remote add origin git@github.com:qontic/qontic-dev.git
git fetch --all --prune
git checkout main
git branch --set-upstream-to=origin/main main
git pull --ff-only
```

If they prefer a fresh clone:

```bash
git clone git@github.com:qontic/qontic-dev.git
cd qontic-dev
git remote add upstream git@github.com:qontic/qontic.git
```

## Daily workflow

```bash
git checkout main
git pull --ff-only
git checkout -b feature/<short-name>
# work, commit
git push -u origin feature/<short-name>
```

Then open a PR in `qontic-dev` (base: `main`).

## Recommended repo settings

1. Set default branch in `qontic-dev` to `main`.
2. Protect `main` in `qontic-dev` (PR required, no force-push).
3. Keep `qontic` as upstream/archive unless explicitly needed.

## Optional sync from qontic (only if needed)

If a change lands in `qontic/main` and must be copied:

```bash
git fetch upstream
git checkout main
git merge --ff-only upstream/main
git push origin main
```

## Short message to share

"`qontic-dev` is now our working repo. Please point your local `origin` to `qontic-dev`, keep `qontic` as `upstream`, create feature branches from `main`, and open PRs into `qontic-dev/main`."
