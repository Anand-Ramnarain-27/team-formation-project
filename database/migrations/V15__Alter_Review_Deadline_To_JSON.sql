-- V11__Alter_Review_Deadline_To_JSONB.sql

-- Alter review_deadline column to JSONB
ALTER TABLE theme
ALTER COLUMN review_deadline TYPE JSON NOT NULL USING review_deadline::JSON;