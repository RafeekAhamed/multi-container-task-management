INSERT INTO tasks (title, description, status)
VALUES
    ('Configure Docker Environment', 'Prepare Docker and Docker Compose for the application.', 'completed'),
    ('Build Backend REST API', 'Implement Express API endpoints for task management.', 'in_progress'),
    ('Create React Frontend', 'Develop the task management dashboard.', 'pending'),
    ('Configure Nginx Reverse Proxy', 'Route frontend and backend traffic through Nginx.', 'pending')
ON CONFLICT DO NOTHING;
