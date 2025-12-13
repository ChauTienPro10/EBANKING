-- V2__Insert_Default_Data.sql
-- Insert default admin user
-- Note: This migration is optional as DataSeeder.java will create admin user automatically
-- Password: 'admin' (hashed with BCrypt)
-- BCrypt hash of "admin": $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVm

-- Insert default admin user (password should be changed in production)
-- Note: Password is 'admin' hashed with BCrypt
-- DataSeeder.java will also create this if it doesn't exist
INSERT IGNORE INTO admins (username, password, full_name, role, active) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVm', 'Default Admin', 'ROLE_SUPER_ADMIN', TRUE);

