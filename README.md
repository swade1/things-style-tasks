# 💧 Water Tracker PWA

A professional, mobile-first Progressive Web App for tracking daily water intake. Built with modern web technologies and designed for offline-first usage.

## 🚀 Tech Stack

- **Frontend**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui utilities
- **Backend**: Supabase (Database, Auth, Storage)
- **PWA**: Vite PWA Plugin + Workbox
- **Deployment**: Vercel
- **Icons**: Lucide React

## ✨ Features (Planned)

- ✅ Quick water intake logging
- ✅ Daily goal tracking
- ✅ Streak counter
- ✅ Water history and analytics
- ✅ Push notifications for reminders
- ✅ Offline support with sync
- ✅ Dark mode
- ✅ Mobile-optimized UI (48px+ touch targets)
- ✅ PWA installable on mobile devices

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase credentials to .env

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 📱 Development

This project follows a 7-day implementation plan. See [PLAN.md](./PLAN.md) for the complete roadmap.

### Day 1 Status: ✅ Complete
- Setup and scaffolding
- PWA foundation
- Development environment ready

See [DAY1-COMPLETE.md](./DAY1-COMPLETE.md) for deployment instructions.

## 🏗️ Project Structure

```
src/
├── components/     # React components
├── lib/            # Utilities and configs
│   ├── supabase.ts # Supabase client
│   └── utils.ts    # Utility functions
├── pages/          # Page components
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
└── utils/          # Helper functions
```

## 🔐 License

MIT

## 👤 Author

Built as part of a 7-day PWA challenge.

