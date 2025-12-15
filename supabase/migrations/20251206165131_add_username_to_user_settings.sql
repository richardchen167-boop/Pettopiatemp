/*
  # Add username to user_settings table

  1. Changes
    - Add `username` column to `user_settings` table
    - This stores each user's username for display purposes
    - Username is required and defaults to 'Anonymous'
  
  2. Notes
    - This allows other users to see usernames without accessing auth metadata
    - Username should be synced from auth.users.user_metadata.username
    - Username is displayed in profiles and pet listings when owner_name is not set
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'username'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN username text NOT NULL DEFAULT 'Anonymous';
  END IF;
END $$;
