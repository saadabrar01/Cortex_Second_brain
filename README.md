# Cortex — Personal Second Brain Dashboard

A dark, glassmorphic dashboard for a personal knowledge base: search and
browse notes, ask an AI questions about them with source citations, write in
a live-previewed markdown editor, and filter everything by tag.

## Stack

- Next.js (App Router) + React
- Tailwind CSS (custom dark theme tokens in `tailwind.config.js`)
- Lucide React icons
- Zero-dependency markdown renderer (`src/utils/markdown.js`) for the live preview

## Getting started

```bash
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_BASE_URL at your FastAPI backend
npm run dev
```

The app runs standalone even without a backend: every service call in
`src/services/` falls back to local mock data (`src/utils/mockData.js`) if the
FastAPI request fails, so you can build and demo the UI before the backend
endpoints exist. Set `NEXT_PUBLIC_USE_MOCK_FALLBACK=false` in `.env.local` once
your API is live.

## Routes

Real file-based routing — every screen has its own address, is bookmarkable,
and works with the browser back/forward buttons:

| Route            | File                                | Screen                                   |
| ----------------- | ------------------------------------ | ----------------------------------------- |
| `/`               | `app/page.jsx`                       | Redirects to `/dashboard`                 |
| `/dashboard`      | `app/dashboard/page.jsx`             | Hero search + recent notes grid           |
| `/dashboard?tag=` | (same file)                          | Dashboard filtered to one tag              |
| `/search`         | `app/search/page.jsx`                | AI chat & search with citation chips      |
| `/search?q=`      | (same file)                          | Same screen, pre-asks the given question  |
| `/editor`         | `app/editor/page.jsx`                | Compose a new note                        |
| `/editor/[id]`    | `app/editor/[id]/page.jsx`           | Edit one existing note by id              |
| `/tags`           | `app/tags/page.jsx`                  | Tag cloud                                 |
| `/tags?tag=`      | (same file)                          | Tag cloud filtered to one tag's notes     |

There's no client-side view-switching context anymore — every "navigate"
action in the UI (clicking a note card, the sidebar links, "Ask AI", a tag
pill) is a real `next/link` `<Link>` or `useRouter().push(...)` call to one of
these routes. A brand-new note is created at `/editor`, and once saved,
`NoteEditor` redirects to its permanent `/editor/{id}` address.

## Project structure

```
src/
├── app/
│   ├── layout.jsx        — root layout: wraps every route in the shared AppShell
│   ├── page.jsx          — redirects "/" to "/dashboard"
│   ├── globals.css
│   ├── dashboard/page.jsx
│   ├── search/page.jsx
│   ├── tags/page.jsx
│   └── editor/
│       ├── page.jsx      — new note
│       └── [id]/page.jsx — edit note by id
├── components/
│   ├── layout/     — app shell, sidebar nav (Link + usePathname), animated background
│   ├── common/     — glass panel, glow button, pill badge, empty state
│   ├── dashboard/  — hero search + recent notes grid
│   ├── search/     — AI chat/search thread with citation chips
│   ├── editor/     — markdown editor, live preview, related notes
│   └── tags/       — tag cloud + filtered notes view
├── services/       — one file per FastAPI resource (notes, chat, tags)
├── hooks/          — small reusable hooks (debounce, etc.)
└── utils/          — markdown rendering, formatting, mock fixtures
```

Pages that read `useSearchParams()` (`/dashboard`, `/search`, `/tags`) wrap
their client component in a `<Suspense>` boundary, which Next.js requires so
the rest of the route can still prerender statically.

## Expected FastAPI contract

Adjust paths in `src/services/*.js` and `NEXT_PUBLIC_API_BASE_URL` to match your
actual router, but the UI is built against this shape:

| Method | Path                     | Purpose                          |
| ------ | ------------------------ | --------------------------------- |
| GET    | `/notes?query=&tag=`     | List / search notes               |
| GET    | `/notes/{id}`            | Get one note                      |
| POST   | `/notes`                 | Create a note                     |
| PUT    | `/notes/{id}`            | Update a note                     |
| DELETE | `/notes/{id}`            | Delete a note                     |
| GET    | `/notes/{id}/related`    | Related-notes suggestions         |
| POST   | `/chat`                  | `{ query, history }` → `{ answer, sources }` |
| GET    | `/tags`                  | `{ name, count }[]`               |
| GET    | `/tags/{tag}/notes`      | Notes for one tag                 |

## Notes on the markdown renderer

`src/utils/markdown.js` is a small hand-written renderer (headings, bold/italic,
inline code, fenced code blocks, blockquotes, links, lists) so the live preview
has zero extra dependencies. Swap it for `react-markdown` + `remark-gfm` if you
need footnotes, tables, or other GFM syntax.
