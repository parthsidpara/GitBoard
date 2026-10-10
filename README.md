# GitBoard

A small tool for deciding what to work on next. It pulls issues from a GitHub
repository and lets you drag them around an [Eisenhower
matrix](https://en.wikipedia.org/wiki/Time_management#The_Eisenhower_method) —
important/urgent, important/not urgent, and so on — so the priority of each
issue is something you can see and rearrange instead of holding in your head.

Sign in with Google, create a board, add issues by hand or import them from any
public repo, tag them with labels, and share a board as a read-only link.

## Features

- Google sign-in via Firebase Auth.
- Multiple boards per user, stored in Firestore and synced live.
- A draggable Eisenhower matrix with per-quadrant colour coding.
- Import open issues from any public GitHub repository (PRs are filtered out).
- Custom labels with colours, on top of a set of built-in ones.
- Share a board as an immutable snapshot link; recipients import their own copy.
- Light, dark, and system themes.

## Tech stack

| Concern      | Choice                                              |
| ------------ | --------------------------------------------------- |
| UI           | React 19, React Router 8                            |
| Language     | TypeScript 7 (see [TypeScript](#typescript) below)  |
| Build        | Vite 8                                              |
| Styling      | Tailwind CSS 4 + [shadcn/ui](https://ui.shadcn.com) |
| Data & auth  | Firebase (Auth + Firestore)                         |
| Client state | Zustand + a thin Context for auth                   |
| Tests        | Vitest + Testing Library                            |

Server state lives in Firestore. The app subscribes to it with `onSnapshot` and
exposes it through small hooks (`useProjects`, `useIssues`, `useLabels`) rather
than a separate caching library, since Firestore is already a realtime cache.

## Getting started

### Prerequisites

- Node.js 22 or newer.
- A Firebase project with **Google** sign-in enabled and **Firestore** created.

### 1. Install

```bash
npm install
```

### 2. Configure environment

Copy the example file and fill in the values from the Firebase console
(_Project settings → General → Your apps → SDK setup_):

```bash
cp .env.example .env
```

These values are not secrets — they ship in the client bundle. Access is
enforced by the rules in [`firestore.rules`](./firestore.rules).

### 3. Apply the security rules

The rules are checked into this repo. Deploy them with the Firebase CLI:

```bash
npx firebase-tools deploy --only firestore:rules
```

They grant owners read/write access to their own boards and labels, and make
`sharedCanvases` publicly readable but only writable on creation.

### 4. Run

```bash
npm run dev
```

## Scripts

| Script               | What it does                                       |
| -------------------- | -------------------------------------------------- |
| `npm run dev`        | Start the dev server.                              |
| `npm run build`      | Typecheck, then build for production into `dist/`. |
| `npm run typecheck`  | Run the TypeScript compiler (`tsc -b`).            |
| `npm run lint`       | Run ESLint.                                        |
| `npm run format`     | Format with Prettier.                              |
| `npm test`           | Run the test suite once.                           |
| `npm run test:watch` | Run tests in watch mode.                           |
| `npm run preview`    | Preview the production build locally.              |

## Project structure

```
src/
  app/         router and top-level providers
  features/    one folder per domain (auth, projects, board, labels, sharing)
                - components, service (Firestore access), and data hooks
  components/  shared app components
    ui/        shadcn/ui primitives (checked in, yours to edit)
  hooks/       small reusable hooks
  lib/         firebase, env, coord math, github api, helpers
  store/       Zustand stores (theme, confirm dialog)
  types/       shared data models
```

Business/data logic lives in each feature's `*.service.ts`; components stay
focused on rendering. Firestore subscriptions are wrapped by the `use*.ts`
hooks so components never touch the SDK directly.

## Data model (Firestore)

```
projects/{projectId}
  name, ownerId, createdAt
  └─ issues/{issueId}
       number, title, url, labels[], x, y   # x/y normalized 0..1

users/{uid}/labels/{labelId}
  name, color

sharedCanvases/{shareId}                     # immutable public snapshot
  name, originalOwnerId, sharedAt, labelsSnapshot
  └─ issues/{issueId}
```

Issue positions are stored normalized (0..1) so a board looks the same at any
viewport size. `y` is measured from the bottom.

## Testing

Tests cover the parts worth testing: coordinate math, the GitHub response
mapping, label colour resolution, and the import dialog's fetch/select flow.
There is no blanket coverage target — add tests where behaviour is non-obvious.

```bash
npm test
```

## TypeScript

This project runs TypeScript 7 (the native compiler) for speed, but the wider
tooling ecosystem (ESLint and friends) still expects the TypeScript 6 API.
Following Microsoft's [side-by-side
guidance](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0-beta/),
`package.json` aliases the packages so both are available:

```jsonc
"typescript": "npm:@typescript/typescript6@^6.0.2", // API for tooling
"typescript-7": "npm:typescript@^7.0.2"             // the actual compiler
```

`npm run typecheck` invokes `typescript-7` explicitly, while ESLint resolves the
6 API through `typescript`. This alias can be dropped once TypeScript 7.1 ships a
stable API.

## Deployment

`npm run build` emits a static site in `dist/`. Host it on any static host
(Firebase Hosting, Vercel, Netlify, GitHub Pages) and configure a SPA fallback
that rewrites unknown paths to `index.html`, since routing is client-side.
Remember to set the `VITE_FIREBASE_*` variables in the host's environment.
