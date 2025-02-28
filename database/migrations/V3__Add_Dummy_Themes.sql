-- V3__Add_Dummy_Themes.sql

-- Add dummy themes
INSERT INTO theme (title, description, submission_deadline, voting_deadline, review_deadline, auto_assign_group, team_lead_acceptance, number_of_groups, created_by, created_at)
VALUES
    (
        'Theme One', 
        'Description for Theme One', 
        NOW() + INTERVAL '7 days',  -- Submission deadline: 7 days from now
        NOW() + INTERVAL '14 days', -- Voting deadline: 14 days from now
        '{"review1": "2023-12-01", "review2": "2023-12-15"}', -- Review deadlines as JSON
        true,  -- Auto assign groups
        false, -- Team lead acceptance not required
        3,     -- Number of groups
        10,    -- Created by user with user_id = 10 (Admin User)
        NOW()  -- Created at current timestamp
    ),
    (
        'Theme Two', 
        'Description for Theme Two', 
        NOW() + INTERVAL '10 days',  -- Submission deadline: 10 days from now
        NOW() + INTERVAL '20 days',  -- Voting deadline: 20 days from now
        '{"review1": "2023-12-05", "review2": "2023-12-20"}', -- Review deadlines as JSON
        false, -- Do not auto assign groups
        true,  -- Team lead acceptance required
        5,     -- Number of groups
        10,    -- Created by user with user_id = 10 (Admin User)
        NOW()  -- Created at current timestamp
    ),
    (
        'Theme Three', 
        'Description for Theme Three', 
        NOW() + INTERVAL '5 days',   -- Submission deadline: 5 days from now
        NOW() + INTERVAL '12 days',  -- Voting deadline: 12 days from now
        '{"review1": "2023-11-30", "review2": "2023-12-10"}', -- Review deadlines as JSON
        true,  -- Auto assign groups
        false, -- Team lead acceptance not required
        4,     -- Number of groups
        10,    -- Created by user with user_id = 11 (Student One)
        NOW()  -- Created at current timestamp
    );