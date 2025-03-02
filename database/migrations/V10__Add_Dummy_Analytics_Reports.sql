-- V9__Add_Created_At_To_Analytics_Reports.sql

-- Add created_at column to analytics_reports table
ALTER TABLE analytics_reports
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;