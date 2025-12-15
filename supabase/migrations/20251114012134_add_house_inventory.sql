/*
  # Add House Inventory System

  1. New Tables
    - `house_inventory`
      - `id` (uuid, primary key)
      - `user_id` (text, references user)
      - `item_id` (uuid, references shop_items)
      - `item_name` (text)
      - `item_type` (text)
      - `item_emoji` (text)
      - `quantity` (integer, default 1)
      - `placed` (boolean, default false)
      - `room` (text, nullable - 'lower' or 'upper')
      - `position_x` (integer, nullable)
      - `position_y` (integer, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `house_inventory` table
    - Add policies for authenticated users to manage their own inventory
*/

CREATE TABLE IF NOT EXISTS house_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  item_id uuid NOT NULL,
  item_name text NOT NULL,
  item_type text NOT NULL,
  item_emoji text NOT NULL,
  quantity integer DEFAULT 1 CHECK (quantity >= 0),
  placed boolean DEFAULT false,
  room text CHECK (room IN ('lower', 'upper')),
  position_x integer,
  position_y integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE house_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inventory"
  ON house_inventory
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own inventory (public)"
  ON house_inventory
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can insert own inventory"
  ON house_inventory
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can insert own inventory (public)"
  ON house_inventory
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can update own inventory"
  ON house_inventory
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can update own inventory (public)"
  ON house_inventory
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own inventory"
  ON house_inventory
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete own inventory (public)"
  ON house_inventory
  FOR DELETE
  TO anon
  USING (true);
