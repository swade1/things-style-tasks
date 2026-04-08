# Things-Style Tasks

A polished Things 3-inspired task manager PWA — built as a learning exercise studying professional mobile-first design, smooth animations, and real-time task management. Not affiliated with Cultured Code.

**Purpose**: Educational only — not for commercial use.

## Tech Stack

- **Frontend**: Vite 8 + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 with glass-surface utility classes
- **Animations**: Framer Motion (lazy-loaded)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **PWA**: vite-plugin-pwa + Workbox (offline support)
- **Deployment**: Vercel
- **Icons**: Lucide React

## Features

### Task Management
- Today, Anytime, and Upcoming views
- Projects with nested task lists
- Tags with multi-select filtering
- Global search with keyboard navigation (↑↓ + Enter)
- Quick Entry sheet for fast task creation
- Task detail sheet — title, notes, due date, tags, project

### UX & Interactions
- Smooth checkbox animations (scale + fill)
- Task completion fade-out
- Horizontal view transitions
- Bottom sheet modals with drag indicator
- Body scroll lock on open sheets
- Escape key to dismiss
- DatePicker outside-click dismiss
- Task drill-down from Project detail sheet

### Technical
- Code-split bundle (vendor-react, vendor-motion, vendor-supabase, vendor-ui)
- Lazy-loaded screens via `React.lazy` + `Suspense`
- Real-time sync via Supabase Realtime
- PWA installable on iOS and Android
- Supabase RLS (row-level security) on all tables

## Getting Started

```bash
npm install

cp .env.example .env
# Add your Supabase credentials

npm run dev
```

## Environment Variables

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Project Structure

```
src/
├── components/     # Shared UI components and sheets
├── pages/          # Top-level views (Today, Anytime, Upcoming, Projects)
├── hooks/          # Custom React hooks (useAuth, useTasks, useProjects)
├── lib/            # Supabase client and utilities
├── types/          # TypeScript type definitions
└── utils/          # Search and helper functions
```

## Database Migrations

SQL migrations live in `supabase/`. Apply them in order via the Supabase SQL Editor.

## License

MIT — educational purposes only.

## 📚 Credits

Inspired by [Things 3](https://culturedcode.com/things/) by Cultured Code GmbH & Co. KG.

**Disclaimer**: This is an educational clone for learning purposes only. Things 3 is a registered trademark of Cultured Code. This project is not affiliated with or endorsed by Cultured Code.

