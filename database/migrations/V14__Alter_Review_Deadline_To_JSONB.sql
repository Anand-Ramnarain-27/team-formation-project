-- V11__Alter_Review_Deadline_To_JSONB.sql

-- Alter review_deadline column to JSONB
ALTER TABLE theme
ALTER COLUMN review_deadline TYPE JSONB USING review_deadline::JSONB;