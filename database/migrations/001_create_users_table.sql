-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    username VARCHAR(30) UNIQUE NOT NULL,
    location VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_users_phone_number ON users (phone_number);
CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_location ON users (location);

-- Add comments
-- This table stores user information for the Pollen8 application
-- phone_number: Stored in E.164 format for international compatibility
-- username: Unique identifier chosen by the user
-- location: User's general location (city, state, or country)
-- created_at: Timestamp when the user account was created
-- last_login: Timestamp of the user's most recent login

-- TODO: Consider adding additional fields such as:
-- - email: VARCHAR(255) UNIQUE
-- - profile_picture_url: VARCHAR(255)
-- - is_verified: BOOLEAN DEFAULT FALSE
-- - is_active: BOOLEAN DEFAULT TRUE
-- - deleted_at: TIMESTAMP WITH TIME ZONE