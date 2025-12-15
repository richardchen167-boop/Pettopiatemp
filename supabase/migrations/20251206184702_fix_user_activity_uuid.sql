/*
  # Fix user_activity table to use UUID

  1. Changes
    - Drop and recreate user_activity table with UUID user_id type
    - Add foreign key constraint to auth.users
    
  2. Security
    - Maintain RLS policies
*/

DROP TABLE IF EXISTS user_activity;

CREATE TABLE IF NOT EXISTS user_activity (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_active timestamptz DEFAULT now(),
  is_online boolean DEFAULT true
);

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all user activity"
  ON user_activity
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own activity"
  ON user_activity
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
  ON user_activity
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activity"
  ON user_activity
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);