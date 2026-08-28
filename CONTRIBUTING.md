# Contributing to OpenBook Store

## Workflow

1. Pull the latest `main`: `git pull`
2. Create a feature branch: `git checkout -b feature/short-description`
3. Make your changes, commit with a clear message
4. Push your branch: `git push -u origin feature/short-description`
5. Open a Pull Request into `main` on GitHub — don't push directly to `main`
6. Get a quick review before merging, even from just one other person on the team

## Where things live

- Backend work → `backend/`
- Frontend/design work → `design-mockup/` (the currently active frontend)
- React work → `frontend/` (not yet wired up — check with the team before building here, see root README)

## Environment setup

- Backend needs its own `.env` file — copy `backend/.env.example` to `backend/.env` and fill in your local values. **Never commit `.env` files** — they're already gitignored.
- The backend uses a local JSON file as its database (`backend/data/db.json`) for now — also gitignored, since it's local test data, not shared data.

## Before opening a PR

- If you touched `backend/`, make sure `npm run dev` starts without errors
- If you touched `design-mockup/`, open the changed page(s) directly in a browser and click through the flow you changed
- Check that any new page you add is actually linked from somewhere (nav, footer, or another page) — no orphaned pages

## Reporting issues

Use GitHub Issues for bugs or feature requests. Include steps to reproduce for bugs.

## Questions

Reach out via the contact info in the repo's About/Contact pages, or ask directly in the team's Teams channel.
