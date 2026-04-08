# Things 3 Clone - 7-Day Implementation Plan

## Overview
**Educational Clone**: Build a Things 3-inspired task management PWA to study professional mobile-first design patterns, smooth animations, and task management architecture.

**Reference App**: [Things 3](https://culturedcode.com/things/) by Cultured Code - 2x Apple Design Award winner ($9.99 iPhone)

**Purpose**: Learning exercise only. Study professional UI/UX patterns, not for commercial use.

## Tech Stack (Already Set Up ✅)
- **Frontend**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS v4 (perfect for Things' clean design)
- **Animations**: Framer Motion (for Things-like smooth transitions)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Offline**: Workbox (service worker + IndexedDB)
- **Hosting**: Vercel (free tier)
- **Icons**: Lucide React

**Day 1 Status**: ✅ Complete - Foundation ready!

---

## Core Features to Implement

### Things 3 Key Features
1. **Today View** - Tasks scheduled for today (central focus)
2. **Anytime View** - Unscheduled tasks waiting to be scheduled
3. **Upcoming View** - Future tasks grouped by date
4. **Projects** - Group related tasks together
5. **Quick Entry** - Fast task creation with (+) button
6. **Task Details** - Edit title, notes, dates, project assignment
7. **Check/Uncheck** - Mark tasks complete with smooth animation
8. **Beautiful Animations** - Smooth, purposeful transitions

---

## Implementation Timeline

### **Day 1: Setup & Scaffolding** ✅ COMPLETE

**What We Did**:
- ✅ Created Vite + React + TypeScript project
- ✅ Installed and configured Tailwind CSS v4
- ✅ Set up Supabase client
- ✅ Configured PWA with Vite PWA plugin
- ✅ Created project structure (components, lib, pages, hooks, types, utils)
- ✅ Initialized Git and pushed to GitHub
- ✅ Built working dev server

**Status**: Foundation is perfect for Things 3 clone!

---

### **Day 2: Database & Core UI** (6-8 hours)

**Morning: Database Schema**
Design Supabase tables for task management:

```sql
-- tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'anytime', -- 'today', 'anytime', 'upcoming', 'someday', 'completed'
  scheduled_date DATE,
  deadline_date DATE,
  project_id UUID REFERENCES projects(id),
  checklist_items JSONB DEFAULT '[]', -- [{id, title, completed}]
  position INTEGER, -- for manual ordering
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_scheduled_date ON tasks(scheduled_date);

-- Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  area_id UUID REFERENCES areas(id),
  status TEXT DEFAULT 'active', -- 'active', 'completed'
  position INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes and RLS for projects
CREATE INDEX idx_projects_user_id ON projects(user_id);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

-- areas table (optional - for future expansion)
CREATE TABLE areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  position INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_preferences table
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  theme TEXT DEFAULT 'light', -- 'light', 'dark', 'system'
  first_day_of_week INTEGER DEFAULT 0, -- 0 = Sunday
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Afternoon: Things-Style UI Components**
Build core components matching Things 3 design:

1. **Navigation Bar**
   - Top bar with view title
   - Back button (when in detail view)
   - Search button
   - Clean, minimal design

2. **Task Row Component**
   - Circular checkbox (not checked: circle outline, checked: filled circle with checkmark)
   - Task title
   - Date indicator (colored dot for scheduled date)
   - Swipe actions (complete, delete)
   - 44px minimum touch target

3. **Bottom Tab Navigation**
   - Today / Anytime / Upcoming / More tabs
   - Badge counts on each tab
   - Active state with blue underline
   - System font icons

4. **Quick Entry Button**
   - Floating (+) button (bottom right)
   - Slides up modal on tap
   - Focus input immediately

5. **Task List Container**
   - Grouped sections (Overdue, Today, etc.)
   - Pull to refresh
   - Empty states

**Evening: Basic Task Operations**
Implement core functionality:

1. **Create Task** (Quick Entry)
   - Modal slides up from bottom
   - Auto-focus text input
   - "Add to Today" or "Add to Anytime" buttons
   - Parse title for dates (stretch goal)

2. **Read Tasks**
   - Fetch tasks from Supabase
   - Filter by status (today, anytime, upcoming)
   - Sort by position, then date, then created_at

3. **Update Task**
   - Toggle completion status
   - Move between views (Today ↔ Anytime)
   - Edit task details

4. **Delete Task**
   - Swipe left to reveal delete button
   - Confirm deletion
   - Remove from database

**Deliverable**: Working Today view with create/read/update/delete tasks

---

### **Day 3: UX Polish & Animations** (6-8 hours)

**Morning: Install & Configure Framer Motion**
```bash
npm install framer-motion
```

Implement Things-style animations:

1. **Checkbox Animation**
   ```tsx
   // Smooth scale + fill animation (like Things)
   <motion.div
     initial={{ scale: 1 }}
     animate={{ scale: completed ? [1, 1.2, 1] : 1 }}
     transition={{ duration: 0.2 }}
   >
     {/* Checkbox SVG */}
   </motion.div>
   ```

2. **Task Completion Animation**
   - Fade out opacity: 1 → 0
   - Slide left slightly
   - Duration: 0.3s ease-out
   - Remove from list after animation

3. **View Transition Animations**
   - Slide horizontal when switching tabs
   - Direction based on tab order (Today → Anytime = slide left)
   - Use AnimatePresence

4. **Quick Entry Modal**
   - Slide up from bottom: translateY(100%) → 0
   - Backdrop fade in
   - Spring animation (not linear)

5. **List Item Animations**
   - Stagger children when list loads
   - Smooth layout shifts with `layout` prop

**Afternoon: Task Detail Sheet**
Build detailed task editor (slides up from bottom):

1. **Layout**
   - Large text input for title
   - Notes textarea (multiline)
   - Date picker section
   - Project assignment dropdown
   - Checklist items section
   - Delete button at bottom

2. **Date Picker**
   - Beautiful custom picker (not native)
   - Today, Tomorrow, This Evening shortcuts
   - Calendar grid for specific dates
   - "Clear schedule" option

3. **Auto-save**
   - Save on input blur
   - Debounce changes (500ms)
   - Optimistic UI updates

4. **Keyboard Handling**
   - Done button on mobile keyboards
   - Tab navigation
   - Esc to close

**Evening: Touch Interactions**
Polish the mobile experience:

1. **Swipe Gestures**
   - Swipe right: Mark complete
   - Swipe left: Show delete button
   - Subtle haptic feedback
   - Use `framer-motion` drag

2. **Long Press**
   - Long press task for quick actions menu
   - Move to Today, Schedule, Delete options

3. **Pull to Refresh**
   - Custom pull-to-refresh component
   - Spinny loading indicator like Things

4. **Tap Interactions**
   - Tap checkbox: Toggle complete
   - Tap task row: Open detail sheet
   - Tap outside modal: Close

**Deliverable**: Smooth, polished interactions matching Things 3 quality

---

### **Day 4: Projects & Multiple Views** (6-8 hours)

**Morning: Projects Feature**
1. **Projects List View**
   - New tab in bottom navigation
   - List of active projects
   - Task count badge per project
   - Swipe to mark project complete

2. **Create/Edit Project**
   - Similar modal to task creation
   - Title and notes fields
   - Optional area assignment (future)
   - Color/emoji picker (optional nice-to-have)

3. **Project Detail View**
   - Show all tasks in project
   - Filter by status
   - Progress indicator (X of Y complete)
   - Quick add task to project

4. **Assign Task to Project**
   - Dropdown in task detail
   - Search/filter projects
   - "None" option to unassign

**Afternoon: Multiple Views Implementation**
Complete the three main views:

1. **Today View**
   - Tasks with `scheduled_date = today` OR `status = 'today'`
   - Overdue section at top (red indicator)
   - This Evening section at bottom (optional)
   - Badge count in tab

2. **Anytime View**
   - Tasks with `status = 'anytime'` (no scheduled_date)
   - Grouped by project
   - "No Project" section at bottom
   - Badge count

3. **Upcoming View**
   - Tasks with `scheduled_date > today`
   - Grouped by date: Tomorrow, This Week, Next Week, Later
   - Date headers with relative labels
   - Calendar icon indicators

4. **View Switching**
   - Bottom tab navigation
   - Animated transitions
   - Badge counts update real-time
   - Persist last viewed tab

**Evening: Scheduling & Moving Tasks**
Implement task movement between views:

1. **Quick Actions**
   - "Move to Today" button
   - "Schedule" button (opens date picker)
   - "Move to Anytime" (clears schedule)
   - Context menu or swipe actions

2. **Scheduling Logic**
   - Set `scheduled_date` = selected date
   - Update `status` based on date (today, upcoming, anytime)
   - Automatically move to correct view
   - Real-time sync across tabs

3. **Natural Date Parsing** (Stretch Goal)
   - Parse "tomorrow" → set date
   - Parse "next monday" → calculate date
   - Use library like `chrono-node` or `date-fns`

**Deliverable**: Full view system with projects and scheduling

---

### **Day 5: Authentication & Sync** (6-8 hours)

**Morning: Supabase Authentication**
Implement user authentication:

1. **Auth UI Components**
   - Login screen (email + password)
   - Sign up screen
   - Password reset flow
   - Simple, clean design like Things

2. **Supabase Auth Integration**
   ```tsx
   // Sign up
   const { data, error } = await supabase.auth.signUp({
     email,
     password
   })
   
   // Sign in
   const { data, error} = await supabase.auth.signInWithPassword({
     email,
     password
   })
   
   // Get session
   const { data: { session } } = await supabase.auth.getSession()
   ```

3. **Auth State Management**
   - React Context for auth state
   - Persist session in localStorage
   - Auto-refresh tokens
   - Protected routes (redirect to login if not authenticated)

4. **First-Time Setup**
   - After signup, create user_preferences record
   - Show brief onboarding (optional)
   - Default to Today view

**Afternoon: Real-time Sync**
Enable multi-device synchronization:

1. **Supabase Realtime Subscriptions**
   ```tsx
   // Subscribe to task changes
   const channel = supabase
     .channel('tasks')
     .on('postgres_changes', 
       { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
       (payload) => {
         // Update local state
       }
     )
     .subscribe()
   ```

2. **Optimistic Updates**
   - Update UI immediately on user action
   - Send request to Supabase in background
   - Revert if error occurs
   - Show loading states subtly

3. **Conflict Resolution**
   - Last-write-wins (simple approach)
   - Use `updated_at` timestamp to determine latest
   - Handle edge cases (deleted task edited on another device)

4. **Loading States**
   - Skeleton loaders for initial fetch
   - Subtle spinners for background sync
   - Don't block UI while syncing

**Evening: Offline Support**
Implement offline-first architecture:

1. **IndexedDB Cache**
   - Use Dexie.js wrapper for IndexedDB
   - Store tasks locally
   - Sync queue for pending changes

2. **Service Worker Strategy**
   - Already configured from Day 1
   - Network-first for API calls
   - Cache-first for static assets
   - Offline fallback

3. **Offline Detection**
   - Monitor `navigator.onLine`
   - Show offline indicator in UI
   - Queue operations when offline
   - Sync when connection restored

4. **Test Offline Scenarios**
   - Airplane mode
   - Poor connection
   - Network switching

**Deliverable**: Multi-device sync with offline support

---

### **Day 6: Advanced Features & Polish** (6-8 hours)

**Morning: Checklist Items (Sub-tasks)**
Add checklist functionality like Things 3:

1. **Database Update**
   - Already have `checklist_items` JSONB column
   - Structure: `[{id: uuid, title: string, completed: boolean}]`

2. **UI Components**
   - Add checklist item button in task detail
   - Inline editable checklist items
   - Checkbox for each item
   - Drag to reorder (stretch goal)

3. **Progress Indicator**
   - Show completion ratio (e.g., "2 of 5")
   - Visual progress bar in task row
   - Update when items checked

4. **Keyboard Shortcuts**
   - Enter to add new checklist item
   - Backspace on empty item to delete

**Afternoon: Search & Quick Find**
Implement fast search:

1. **Quick Find Modal**
   - Cmd/Ctrl+K to open
   - Fuzzy search across tasks and projects
   - Search by title and notes
   - Recent searches

2. **Search Implementation**
   ```tsx
   const { data } = await supabase
     .from('tasks')
     .select('*')
     .ilike('title', `%${query}%`)
     .or(`notes.ilike.%${query}%`)
   ```

3. **Search Results UI**
   - Grouped by status/project
   - Keyboard navigation (arrow keys)
   - Enter to select
   - Esc to close

4. **Performance**
   - Debounce search input (300ms)
   - Limit results to 50
   - Show loading state

**Evening: Settings & Preferences**
Build settings page:

1. **Settings Screen**
   - Accessible from "More" tab
   - Clean list design like iOS Settings

2. **Preferences**
   - Theme toggle (Light / Dark / System)
   - First day of week (for Upcoming view)
   - Account management
   - Sign out button

3. **About Page**
   - App version
   - Credits: "Inspired by Things 3 by Cultured Code"
   - Educational project disclaimer
   - Privacy policy link (if needed)

4. **Empty States**
   - Beautiful illustrations for empty Today view
   - "No tasks today" with motivational message
   - Empty Anytime view
   - Empty Projects list
   - Onboarding hints

**Deliverable**: Feature-complete task manager

---

### **Day 7: Final Polish & Deployment** (4-6 hours)

**Morning: UI Refinement**
Match Things 3's visual quality:

1. **Color Palette**
   ```css
   /* Things 3 color system */
   --blue-primary: #3478F6;        /* Primary blue */
   --text-primary: #000000;        /* Black text */
   --text-secondary: #8E8E93;      /* Gray secondary text */
   --background: #F2F2F7;          /* Light gray background */
   --card-background: #FFFFFF;     /* White cards */
   --border: #C6C6C8;              /* Light gray borders */
   --success-green: #34C759;       /* Green for completed */
   --overdue-red: #FF3B30;         /* Red for overdue */
   ```

2. **Typography**
   ```css
   font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif;
   ```

3. **Spacing & Layout**
   - Use 8px grid system (padding multiples of 8)
   - Generous whitespace between sections
   - 16px horizontal margins on mobile
   - 44px minimum touch targets

4. **Micro-interactions**
   - Subtle hover states (on desktop)
   - Active press states with scale(0.98)
   - Smooth color transitions
   - Haptic feedback on mobile

**Afternoon: Performance Optimization**
Ensure smooth performance:

1. **Code Splitting**
   ```tsx
   const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
   ```

2. **Bundle Analysis**
   ```bash
   npm run build
   npx vite-bundle-visualizer
   ```
   - Remove unused dependencies
   - Tree-shake large libraries
   - Lazy load heavy components

3. **Image Optimization**
   - Compress PNG icons
   - Use SVG where possible
   - WebP format for photos

4. **Lighthouse Audit**
   - Run in Chrome DevTools
   - Target: 90+ on all metrics
   - Fix accessibility issues
   - Optimize LCP (Largest Contentful Paint)

**Evening: Deploy to Vercel**
Launch the app:

1. **Create Production Supabase Project**
   - New project at supabase.com
   - Run database migration SQL
   - Enable Row Level Security
   - Copy API keys

2. **Deploy to Vercel**
   - Push latest code to GitHub
   - Import project in Vercel dashboard
   - Add environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Deploy!

3. **Test on Real Devices**
   - iPhone (Safari)
   - Android (Chrome)
   - Tablet (iPad)
   - Install as PWA
   - Test offline mode
   - Test multi-device sync

4. **Share Demo**
   - Get feedback from friends
   - Note any bugs or UX issues
   - Iterate if time permits

**Deliverable**: Live Things 3 clone at your-domain.vercel.app

---

## Design Reference

### Things 3's Design Principles
1. **Minimalism** - No visual clutter, purposeful UI
2. **Typography** - San Francisco system font
3. **Color** - Subtle blues for interactive elements
4. **Animations** - Smooth, never jarring
5. **Whitespace** - Generous spacing
6. **Tactile Feel** - Satisfying to use
7. **Speed** - Instant feedback, no lag

### Key Animations
- **Checkbox**: Scale + fill (0.2s ease)
- **Task Complete**: Fade + slide left (0.3s ease-out)
- **View Transition**: Horizontal slide (0.25s ease-in-out)
- **Modal**: Slide up from bottom (0.3s spring)

### Component Patterns
- **Lists**: White background, subtle dividers
- **Cards**: Rounded corners (12px), shadow
- **Buttons**: Subtle blue, no heavy borders
- **Inputs**: Minimal styling, focus ring only

---

## Success Metrics

### Educational Goals
- ✅ Learn professional UI animation patterns
- ✅ Practice component architecture
- ✅ Master task management data modeling
- ✅ Build production-quality PWA
- ✅ Understand Things 3's UX philosophy

### Technical Goals
- [ ] <100ms interaction latency
- [ ] Lighthouse score 90+
- [ ] Works offline completely
- [ ] Syncs across devices instantly
- [ ] Installable as PWA
- [ ] Zero layout shift (CLS = 0)
- [ ] Smooth 60fps animations

### Feature Completeness
- [ ] Core task management (create, read, update, delete)
- [ ] Three main views (Today, Anytime, Upcoming)
- [ ] Projects with task grouping
- [ ] Task scheduling and dates
- [ ] Smooth animations throughout
- [ ] Offline support with sync
- [ ] Multi-device support

---

## Study Resources

### Essential
- [Things 3 iOS App](https://apps.apple.com/us/app/things-3/id904237743) - Primary reference (download and study)
- [Things Support](https://culturedcode.com/things/support/) - Feature documentation
- [Things Blog](https://culturedcode.com/things/blog/) - Design philosophy

### Inspiration
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Framer Motion Examples](https://www.framer.com/motion/)
- [Linear App](https://linear.app/) - Similar polish level

### Technical
- [Supabase Docs](https://supabase.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [React Patterns](https://reactpatterns.com/)

---

## Important Notes

**This is an educational clone to study professional app development.**

- ✅ Learning UI/UX patterns from award-winning app
- ✅ Practicing modern React architecture
- ✅ Building production-quality software
- ❌ Not for commercial use or distribution
- ❌ Not competing with Things 3
- ✅ Will credit Things 3 as inspiration

**Key Learnings:**
1. How to build smooth, purposeful animations
2. Task management system architecture
3. Real-time sync patterns with Supabase
4. Professional mobile-first design
5. PWA best practices and offline-first approach

**Legal:** This is a personal learning project. Things 3 is a trademark of Cultured Code GmbH & Co. KG. This clone is not affiliated with or endorsed by Cultured Code.

