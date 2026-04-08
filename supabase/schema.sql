-- Things 3 Clone - Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- AREAS TABLE (Create first - no dependencies)
-- =====================================================
CREATE TABLE areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_areas_user_id ON areas(user_id);

-- Enable RLS
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for areas
CREATE POLICY "Users can manage own areas" ON areas
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- PROJECTS TABLE (Create second - depends on areas)
-- =====================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active', -- 'active', 'completed'
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_area_id ON projects(area_id);
CREATE INDEX idx_projects_status ON projects(status);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects (simplified - all operations in one)
CREATE POLICY "Users can manage own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- TASKS TABLE (Create third - depends on projects)
-- =====================================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'anytime', -- 'today', 'anytime', 'upcoming', 'someday', 'completed'
  scheduled_date DATE,
  deadline_date DATE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}', -- lightweight labels for organizing tasks
  checklist_items JSONB DEFAULT '[]', -- [{id, title, completed}]
  position INTEGER DEFAULT 0, -- for manual ordering within a list
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_scheduled_date ON tasks(scheduled_date);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_tags ON tasks USING GIN (tags);
CREATE INDEX idx_tasks_completed_at ON tasks(completed_at);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- USER PREFERENCES TABLE
-- =====================================================
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  theme TEXT DEFAULT 'light', -- 'light', 'dark', 'system'
  first_day_of_week INTEGER DEFAULT 0, -- 0 = Sunday, 1 = Monday
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_areas_updated_at
  BEFORE UPDATE ON areas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA (Optional - for testing)
-- =====================================================

-- Uncomment to add sample data after authentication is set up
-- Note: Replace 'YOUR_USER_ID' with actual user ID after signing up

/*
-- Sample area
INSERT INTO areas (user_id, title, position) VALUES
  ('YOUR_USER_ID', 'Personal', 1);

-- Sample project (using area_id from above if needed)
INSERT INTO projects (user_id, title, notes, status, position) VALUES
  ('YOUR_USER_ID', 'Learning', 'Educational projects', 'active', 1);

-- Sample tasks
INSERT INTO tasks (user_id, title, status, scheduled_date, position) VALUES
  ('YOUR_USER_ID', 'Review Things 3 design patterns', 'today', CURRENT_DATE, 1),
  ('YOUR_USER_ID', 'Build task completion animation', 'today', CURRENT_DATE, 2),
  ('YOUR_USER_ID', 'Implement swipe gestures', 'anytime', NULL, 1),
  ('YOUR_USER_ID', 'Add keyboard shortcuts', 'upcoming', CURRENT_DATE + 3, 1);

-- Sample user preferences
INSERT INTO user_preferences (user_id, theme, first_day_of_week) VALUES
  ('YOUR_USER_ID', 'light', 1);
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check tables were created
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies
-- SELECT * FROM pg_policies WHERE schemaname = 'public';
