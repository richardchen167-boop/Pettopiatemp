/*
  # Create user_sessions table

  1. New Tables
    - `user_sessions`
      - `user_id` (uuid, primary key) - Links to auth.users
      - `total_time_seconds` (integer) - Total time spent on site
      - `last_active` (timestamptz) - Last activity timestamp
      - `created_at` (timestamptz) - When session tracking started
      - `updated_at` (timestamptz) - Last update timestamp
  
  2. Security
    - Enable RLS on `user_sessions` table
    - Add policy for authenticated users to read their own session data
    - Add policy for authenticated users to insert their own session data
    - Add policy for authenticated users to update their own session data
*/

CREATE TABLE IF NOT EXISTS user_sessions (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_time_seconds integer NOT NULL DEFAULT 0 CHECK (total_time_seconds >= 0),
  last_active timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own session data"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own session data"
  ON user_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own session data"
  ON user_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);