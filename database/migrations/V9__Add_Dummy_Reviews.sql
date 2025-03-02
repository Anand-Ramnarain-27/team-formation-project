-- V5__Add_Dummy_Reviews.sql

-- Add dummy reviews
INSERT INTO review (reviewer_id, reviewee_id, group_id, rating, feedback, created_at)
VALUES
    (
        11,  -- Reviewer: Student One (user_id = 11)
        12,  -- Reviewee: Student Two (user_id = 12)
        9,   -- Group One (group_id = 1)
        'FOUR',  -- Rating: 4
        'Great teamwork and communication skills.', 
        NOW()
    ),
    (
        12,  -- Reviewer: Student Two (user_id = 12)
        11,  -- Reviewee: Student One (user_id = 11)
        9,   -- Group One (group_id = 1)
        'FIVE',  -- Rating: 5
        'Excellent problem-solving abilities.', 
        NOW()
    ),
    (
        13,  -- Reviewer: Student Three (user_id = 13)
        11,  -- Reviewee: Student One (user_id = 11)
        10,   -- Group Two (group_id = 2)
        'THREE',  -- Rating: 3
        'Good effort, but needs to improve time management.', 
        NOW()
    );