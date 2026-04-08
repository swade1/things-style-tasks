-- Day 6: Add tags support to tasks
-- Run this in the Supabase SQL Editor after the auth + recurring migrations

ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}'::text[];

UPDATE tasks
SET tags = '{}'::text[]
WHERE tags IS NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_tags ON tasks USING GIN (tags);
