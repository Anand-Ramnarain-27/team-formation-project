-- V12__Alter_Review_Deadline_To_JSON_NotNull.sql

-- Step 1: Alter review_deadline column to JSON
ALTER TABLE theme
ALTER COLUMN review_deadline TYPE JSON USING review_deadline::JSON;

-- Step 2: Set review_deadline column to NOT NULL
ALTER TABLE theme
ALTER COLUMN review_deadline SET NOT NULL;