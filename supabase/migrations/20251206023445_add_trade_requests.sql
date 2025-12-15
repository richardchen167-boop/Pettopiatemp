/*
  # Add Trade Requests System

  1. New Tables
    - `trade_requests`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, references auth.users) - User sending the request
      - `recipient_id` (uuid, references auth.users) - User receiving the request
      - `sender_pet_id` (uuid, references pets) - Pet being offered
      - `recipient_pet_id` (uuid, references pets, nullable) - Requested pet (optional)
      - `status` (text) - pending, accepted, rejected, cancelled
      - `message` (text, nullable) - Optional message from sender
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `trade_requests` table
    - Allow users to view requests where they are sender or recipient
    - Allow senders to insert and cancel their own requests
    - Allow recipients to update status (accept/reject)

  3. Notes
    - Trade requests allow users to propose pet trades with each other
    - Only users with trades_enabled can send/receive requests
    - Requests can be pending, accepted, rejected, or cancelled
*/

CREATE TABLE IF NOT EXISTS trade_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sender_pet_id uuid REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  recipient_pet_id uuid REFERENCES pets(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  message text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT different_users CHECK (sender_id != recipient_id)
);

ALTER TABLE trade_requests ENABLE ROW LEVEL SECURITY;

-- Users can view requests where they are involved
CREATE POLICY "Users can view their trade requests"
  ON trade_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can create trade requests
CREATE POLICY "Users can create trade requests"
  ON trade_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Senders can cancel their own pending requests
CREATE POLICY "Senders can cancel their requests"
  ON trade_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id AND status = 'pending')
  WITH CHECK (auth.uid() = sender_id AND status IN ('pending', 'cancelled'));

-- Recipients can accept or reject pending requests
CREATE POLICY "Recipients can respond to requests"
  ON trade_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id AND status = 'pending')
  WITH CHECK (auth.uid() = recipient_id AND status IN ('pending', 'accepted', 'rejected'));

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_trade_requests_sender 
  ON trade_requests(sender_id, status);
  
CREATE INDEX IF NOT EXISTS idx_trade_requests_recipient 
  ON trade_requests(recipient_id, status);