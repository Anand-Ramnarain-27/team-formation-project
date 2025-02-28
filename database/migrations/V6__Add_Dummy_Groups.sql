-- V6__Add_Dummy_Groups.sql

-- Add dummy groups
INSERT INTO groups (theme_id, group_name, team_lead, created_at)
VALUES
    (
        19,  -- Theme One (theme_id = 19)
        'Idea One', 
        11,  -- Team lead: Student One (user_id = 11)
        NOW()
    ),
    (
        20,  -- Theme Two (theme_id = 20)
        'Idea Two', 
        12,  -- Team lead: Student Two (user_id = 12)
        NOW()
    );