
INSERT INTO users (name, email, role, auth_provider, created_at)
VALUES
    ('Admin User', 'admin@example.com', 'Admin', 'local', NOW()),
    ('Student One', 'student1@example.com', 'Student', 'local', NOW()),
    ('Student Two', 'student2@example.com', 'Student', 'local', NOW()),
    ('Student Three', 'student3@example.com', 'Student', 'local', NOW());