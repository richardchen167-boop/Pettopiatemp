/*
  # Add User Trade Settings

  1. New Tables
    - `user_settings`
      - `user_id` (uuid, primary key, references auth.users)
      - `trades_enabled` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_settings` table
    - Add policy for users to view any user's trade setting (for trade discovery)
    - Add policy for users to update only their own settings

  3. Notes
    - This allows users to opt-in to trading pets with others
    - The trades_enabled flag indicates if a user is open to receiving trade requests
*/

CREATE TABLE IF NOT EXISTS user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  trades_enabled boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view trade settings (needed for trade discovery)
CREATE POLICY "Anyone can view user trade settings"
  ON user_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own settings
CREATE POLICY "Users can insert own settings"
  ON user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update own settings"
  ON user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_trades_enabled 
  ON user_settings(trades_enabled) 
  WHERE trades_enabled = true;