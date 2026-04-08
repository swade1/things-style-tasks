-- TEMPORARY: Remove Foreign Key Constraints for Development
-- This allows testing without authentication
-- We'll restore proper constraints in Day 5 when we implement auth

-- Drop foreign key constraints on user_id columns
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_user_id_fkey;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_user_id_fkey;
ALTER TABLE areas DROP CONSTRAINT IF EXISTS areas_user_id_fkey;
ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;

-- Verify constraints are removed
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE confrelid = 'auth.users'::regclass
ORDER BY conrelid::regclass::text;

-- This should return no rows if successful
