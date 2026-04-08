-- Add Recurring Tasks Support
-- Day 4: Enable tasks to repeat on a schedule

-- Add recurrence fields to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS recurrence_rule TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS recurrence_end_date DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS recurrence_parent_id UUID DEFAULT NULL REFERENCES tasks(id) ON DELETE CASCADE;

-- Create index for finding recurring task instances
CREATE INDEX IF NOT EXISTS idx_tasks_recurrence_parent 
ON tasks(recurrence_parent_id) 
WHERE recurrence_parent_id IS NOT NULL;

-- Comments for documentation
COMMENT ON COLUMN tasks.recurrence_rule IS 'Recurrence pattern: daily, weekly, monthly, or custom RRULE format';
COMMENT ON COLUMN tasks.recurrence_end_date IS 'Optional end date for recurring series';
COMMENT ON COLUMN tasks.recurrence_parent_id IS 'Links to parent recurring task (for instances)';

-- Example recurrence_rule values:
-- 'daily' - Every day
-- 'weekly' - Every week on same day
-- 'monthly' - Every month on same date
-- 'FREQ=DAILY;INTERVAL=2' - Every 2 days (RRULE format for advanced patterns)
-- 'FREQ=WEEKLY;BYDAY=MO,WE,FR' - Every Monday, Wednesday, Friday

SELECT 'Recurring tasks schema added successfully' as status;
