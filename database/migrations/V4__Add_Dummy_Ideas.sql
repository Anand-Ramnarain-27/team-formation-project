-- V4__Add_Dummy_Ideas.sql

-- Add dummy ideas
INSERT INTO ideas (theme_id, submitted_by, idea_name, description, status, created_at)
VALUES
    (
        19,  -- Theme One (theme_id = 19)
        11,  -- Submitted by Student One (user_id = 11)
        'Idea One', 
        'Description for Idea One', 
        'Pending', 
        NOW()
    ),
    (
        19,  -- Theme One (theme_id = 19)
        12,  -- Submitted by Student Two (user_id = 12)
        'Idea Two', 
        'Description for Idea Two', 
        'Pending', 
        NOW()
    ),
    (
        20,  -- Theme Two (theme_id = 20)
        13,  -- Submitted by Student Three (user_id = 13)
        'Idea Three', 
        'Description for Idea Three', 
        'Pending', 
        NOW()
    );