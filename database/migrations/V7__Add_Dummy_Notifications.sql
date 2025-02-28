-- Add dummy notifications
INSERT INTO notifications (recipient_role, message, created_by, created_at)
VALUES
    (
        'Admin', 
        'A new theme has been created.', 
        10,  -- Created by Admin User (user_id = 10)
        NOW()
    ),
    (
        'Student', 
        'You have been assigned to a group.', 
        10,  -- Created by Admin User (user_id = 10)
        NOW()
    ),
    (
        'Student', 
        'Voting for Theme One has started.', 
        11,  -- Created by Student One (user_id = 11)
        NOW()
    ),
    (
        'Student', 
        'Your idea has been approved.', 
        12,  -- Created by Student Two (user_id = 12)
        NOW()
    );