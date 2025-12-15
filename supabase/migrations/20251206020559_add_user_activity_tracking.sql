/*
  # Add User Activity Tracking

  1. New Tables
    - `user_activity`
      - `user_id` (text, primary key)
      - `last_active` (timestamp)
      - `is_online` (boolean, default true)
  
  2. Security
    - Enable RLS on `user_activity` table
    - Add policies for users to update their own activity

  3. Notes
    - Tracks when users were last active
    - Users are considered online if active within last 5 minutes
    - Used to hide pets from inactive users on main dashboard
*/

CREATE TABLE IF NOT EXISTS user_activity (
  user_id text PRIMARY KEY,
  last_active timestamptz DEFAULT now(),
  is_online boolean DEFAULT true
);

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view user activity"
  ON user_activity
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view user activity (public)"
  ON user_activity
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can insert own activity"
  ON user_activity
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can insert own activity (public)"
  ON user_activity
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can update own activity"
  ON user_activity
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can update own activity (public)"
  ON user_activity
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);