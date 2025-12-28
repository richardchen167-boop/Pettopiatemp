/*
  # Extend Trade Requests System to Support Item Trading

  1. New Tables
    - `trade_items` - Junction table linking trade requests to items being traded
      - `id` (uuid, primary key)
      - `trade_request_id` (uuid, references trade_requests)
      - `sender_offering` (boolean) - true if sender is offering, false if receiver is offering
      - `item_id` (uuid) - ID of the shop item or inventory item
      - `item_type` (text) - Type: hat, eyewear, toy, furniture, decor
      - `item_name` (text) - Name of the item
      - `item_emoji` (text) - Emoji representation
      - `created_at` (timestamptz)

  2. Changes
    - Trade requests now support trading multiple items
    - Items can be accessories or house items
    - Clean separation of concerns with junction table

  3. Security
    - Enable RLS on `trade_items` table
    - Users can view items only for their trade requests
    - Items are inserted/deleted with trades
*/

CREATE TABLE IF NOT EXISTS trade_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_request_id uuid REFERENCES trade_requests(id) ON DELETE CASCADE NOT NULL,
  sender_offering boolean NOT NULL,
  item_id uuid NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('hat', 'eyewear', 'toy', 'furniture', 'decor')),
  item_name text NOT NULL,
  item_emoji text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE trade_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items in their trade requests"
  ON trade_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trade_requests
      WHERE trade_requests.id = trade_items.trade_request_id
      AND (trade_requests.sender_id = auth.uid() OR trade_requests.recipient_id = auth.uid())
    )
  );

CREATE POLICY "Only senders can insert sender items"
  ON trade_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_offering = true AND
    EXISTS (
      SELECT 1 FROM trade_requests
      WHERE trade_requests.id = trade_items.trade_request_id
      AND trade_requests.sender_id = auth.uid()
    )
  );

CREATE POLICY "Only recipients can insert recipient items"
  ON trade_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_offering = false AND
    EXISTS (
      SELECT 1 FROM trade_requests
      WHERE trade_requests.id = trade_items.trade_request_id
      AND trade_requests.recipient_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from their trades"
  ON trade_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trade_requests
      WHERE trade_requests.id = trade_items.trade_request_id
      AND (
        (trade_requests.sender_id = auth.uid() AND sender_offering = true) OR
        (trade_requests.recipient_id = auth.uid() AND sender_offering = false)
      )
    )
  );

CREATE INDEX IF NOT EXISTS idx_trade_items_request
  ON trade_items(trade_request_id);

CREATE INDEX IF NOT EXISTS idx_trade_items_sender_offering
  ON trade_items(trade_request_id, sender_offering);
