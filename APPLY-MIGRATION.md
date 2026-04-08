# Apply Recurring Tasks Migration

## You need to run this SQL in your Supabase Dashboard

1. Open your Supabase project at https://supabase.com
2. Go to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the SQL below
5. Click **Run** or press `Cmd+Enter`

```sql
-- Add Recurring Tasks Support
-- This enables tasks to repeat on a schedule

-- Add recurrence fields to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS recurrence_rule TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS recurrence_end_date DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS recurrence_parent_id UUID DEFAULT NULL REFERENCES tasks(id) ON DELETE CASCADE;

-- Create index for finding recurring task instances
CREATE INDEX IF NOT EXISTS idx_tasks_recurrence_parent 
ON tasks(recurrence_parent_id) 
WHERE recurrence_parent_id IS NOT NULL;

-- Verify migration succeeded
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND column_name IN ('recurrence_rule', 'recurrence_end_date', 'recurrence_parent_id');
```

## After Running

You should see 3 rows returned showing the new columns:
- recurrence_rule (text)
- recurrence_end_date (date)
- recurrence_parent_id (uuid)

## Then Refresh Your App

After the migration completes:
1. Refresh the browser (Cmd+R or F5)
2. Open a task detail sheet
3. You should now see the **Repeat** dropdown with options: Never / Daily / Weekly / Monthly

## How Recurring Tasks Work

1. Set a task to repeat (e.g., "Daily")
2. When you complete it, the current instance moves to completed
3. A new instance is automatically created for the next occurrence
4. Recurring tasks show a purple 🔄 icon in the list
