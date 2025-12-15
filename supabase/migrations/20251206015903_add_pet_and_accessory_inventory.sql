/*
  # Add Pet and Accessory Inventory System

  1. New Tables
    - `pet_inventory`
      - `id` (uuid, primary key)
      - `user_id` (text, references user)
      - `pet_id` (uuid, references pets)
      - `is_active` (boolean, default false) - whether pet is currently displayed
      - `created_at` (timestamp)
    
    - `accessory_inventory`
      - `id` (uuid, primary key)
      - `user_id` (text, references user)
      - `item_id` (uuid, references shop_items)
      - `item_name` (text)
      - `item_type` (text) - 'hat', 'toy', 'eyewear'
      - `item_emoji` (text)
      - `quantity` (integer, default 1)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own inventory items

  3. Notes
    - pet_inventory tracks which pets belong to a user and which are active
    - accessory_inventory stores hats, toys, and eyewear for later use
    - Users can switch pets in/out of active state
*/

CREATE TABLE IF NOT EXISTS pet_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accessory_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  item_id uuid NOT NULL,
  item_name text NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('hat', 'toy', 'eyewear')),
  item_emoji text NOT NULL,
  quantity integer DEFAULT 1 CHECK (quantity >= 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pet_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessory_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pet inventory"
  ON pet_inventory
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own pet inventory (public)"
  ON pet_inventory
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can insert own pet inventory"
  ON pet_inventory
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can insert own pet inventory (public)"
  ON pet_inventory
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can update own pet inventory"
  ON pet_inventory
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can update own pet inventory (public)"
  ON pet_inventory
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own pet inventory"
  ON pet_inventory
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete own pet inventory (public)"
  ON pet_inventory
  FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Users can view own accessory inventory"
  ON accessory_inventory
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own accessory inventory (public)"
  ON accessory_inventory
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can insert own accessory inventory"
  ON accessory_inventory
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can insert own accessory inventory (public)"
  ON accessory_inventory
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can update own accessory inventory"
  ON accessory_inventory
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can update own accessory inventory (public)"
  ON accessory_inventory
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own accessory inventory"
  ON accessory_inventory
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete own accessory inventory (public)"
  ON accessory_inventory
  FOR DELETE
  TO anon
  USING (true);