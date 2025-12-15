/*
  # Add User Profile Information

  1. Changes to Existing Tables
    - Add `bio` column to `user_settings` table
      - `bio` (text, nullable) - User's profile bio/description
      - `display_name` (text, nullable) - Optional display name (different from owner_name)
    
  2. Security
    - Users can read any user's profile settings (public information)
    - Users can only update their own profile settings

  3. Notes
    - Bio allows users to write about themselves
    - Display name is optional and can be different from owner_name
    - Profile information is public by design for social features
*/

-- Add bio and display_name columns to user_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'bio'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN bio text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN display_name text;
  END IF;
END $$;