-- V10__Add_Dummy_Analytics_Reports.sql

-- Add dummy analytics reports
INSERT INTO analytics_reports (theme_id, total_students, total_reports, average_rating, participation_stats, created_at)
VALUES
    (
        19,  -- Theme One (theme_id = 19)
        3,   -- Total students: 3
        2,   -- Total reports: 2
        4.5, -- Average rating: 4.5
        '{"participation_rate": 90, "active_students": 3}', 
        NOW()
    ),
    (
        20,  -- Theme Two (theme_id = 20)
        2,   -- Total students: 2
        1,   -- Total reports: 1
        3.8, -- Average rating: 3.8
        '{"participation_rate": 80, "active_students": 2}', 
        NOW()
    );