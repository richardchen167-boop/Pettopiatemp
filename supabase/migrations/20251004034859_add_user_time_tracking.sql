/*
  # Add User Time Tracking
  
  1. New Tables
    - `user_sessions`
      - `id` (uuid, primary key)
      - `user_id` (text, user identifier from localStorage)
      - `total_time_seconds` (integer, cumulative time spent on site)
      - `last_active` (timestamptz, last activity timestamp)
      - `created_at` (timestamptz, when user first visited)
      - `updated_at` (timestamptz, last update timestamp)
  
  2. Security
    - Enable RLS on `user_sessions` table
    - Allow public read access to view all user sessions
    - Allow public insert/update access for session tracking
  
  3. Purpose
    - Track how much time each user has spent on the site
    - Display time stats in header and on pet cards
*/

CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  total_time_seconds integer DEFAULT 0,
  last_active timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view user sessions"
  ON user_sessions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create user sessions"
  ON user_sessions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update user sessions"
  ON user_sessions
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);