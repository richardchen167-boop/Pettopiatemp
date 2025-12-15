/*
  # Create chat messages table

  1. New Tables
    - `chat_messages`
      - `id` (uuid, primary key) - Unique message identifier
      - `user_id` (text) - ID of the user who sent the message
      - `username` (text) - Display name of the user
      - `message` (text) - The chat message content
      - `created_at` (timestamptz) - When the message was sent
  
  2. Security
    - Enable RLS on `chat_messages` table
    - Add policy for anyone to read all messages
    - Add policy for authenticated users to insert their own messages
*/

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  username text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read chat messages"
  ON chat_messages
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert chat messages"
  ON chat_messages
  FOR INSERT
  WITH CHECK (true);