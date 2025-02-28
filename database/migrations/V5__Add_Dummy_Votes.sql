-- V5__Add_Dummy_Votes.sql

-- Add dummy votes
INSERT INTO votes (idea_id, voted_by, created_at)
VALUES
    (
        3,  -- Idea One (idea_id = 1)
        12, -- Voted by Student Two (user_id = 12)
        NOW()
    ),
    (
        4,  -- Idea One (idea_id = 1)
        13, -- Voted by Student Three (user_id = 13)
        NOW()
    ),
    (
        5,  -- Idea Two (idea_id = 2)
        11, -- Voted by Student One (user_id = 11)
        NOW()
    );