/*
  # User Followers System

  1. New Tables
    - `user_followers`
      - `id` (uuid, primary key) - Unique identifier for the follow relationship
      - `follower_id` (uuid, foreign key) - User who is following
      - `following_id` (uuid, foreign key) - User being followed
      - `created_at` (timestamptz) - When the follow relationship was created

  2. Security
    - Enable RLS on `user_followers` table
    - Add policy for authenticated users to view all follow relationships
    - Add policy for authenticated users to create follows (follow others)
    - Add policy for authenticated users to delete their own follows (unfollow)

  3. Constraints
    - Unique constraint to prevent duplicate follows
    - Check constraint to prevent users from following themselves
*/

-- Create user_followers table
CREATE TABLE IF NOT EXISTS user_followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES user_settings(user_id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES user_settings(user_id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS
ALTER TABLE user_followers ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can view all follow relationships
CREATE POLICY "Users can view all follow relationships"
  ON user_followers FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can create follows
CREATE POLICY "Users can follow others"
  ON user_followers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

-- Policy: Authenticated users can delete their own follows
CREATE POLICY "Users can unfollow others"
  ON user_followers FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_followers_follower_id ON user_followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_followers_following_id ON user_followers(following_id);