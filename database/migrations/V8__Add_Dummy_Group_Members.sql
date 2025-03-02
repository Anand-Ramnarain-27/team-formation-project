-- V7__Add_Dummy_Group_Members.sql

-- Add dummy group members
INSERT INTO group_members (group_id, user_id, created_at)
VALUES
    (
        9,  -- Group One (group_id = 1)
        11, -- Student One (user_id = 11)
        NOW()
    ),
    (
        9,  -- Group One (group_id = 1)
        12, -- Student Two (user_id = 12)
        NOW()
    ),
    (
        10,  -- Group Two (group_id = 2)
        13, -- Student Three (user_id = 13)
        NOW()
    );