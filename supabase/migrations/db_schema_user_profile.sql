-- User Profile Customization: Add avatar, nickname, and badges to users table
ALTER TABLE users ADD COLUMN avatar_url TEXT;
ALTER TABLE users ADD COLUMN nickname TEXT;
ALTER TABLE users ADD COLUMN badges TEXT[] DEFAULT ARRAY[]::TEXT[];
