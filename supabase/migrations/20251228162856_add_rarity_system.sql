/*
  # Add Rarity System

  1. New Tables
    - `rarity_loot_table` - Contains all possible accessories that drop from chests with their rarity
    - `user_chests` - Tracks inventory of purchased chests

  2. Schema Updates
    - `pets` - Add rarity column (common, uncommon, rare, hyper rare, legendary, mythical, impossible)
    - `shop_items` - Add rarity column

  3. Rarity Distribution for Chests
    - Common: 45%
    - Uncommon: 30%
    - Rare: 15%
    - Hyper Rare: 6%
    - Legendary: 3%
    - Mythical: 1%
    - Impossible: 0.1%
*/

DO $$
BEGIN
  -- Add rarity to pets table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'rarity'
  ) THEN
    ALTER TABLE pets ADD COLUMN rarity TEXT DEFAULT 'common';
  END IF;

  -- Add rarity to shop_items table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shop_items' AND column_name = 'rarity'
  ) THEN
    ALTER TABLE shop_items ADD COLUMN rarity TEXT DEFAULT 'common';
  END IF;
END $$;

-- Create rarity loot table for chest drops
CREATE TABLE IF NOT EXISTS rarity_loot_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL,
  item_name text NOT NULL,
  item_emoji text NOT NULL,
  item_type text NOT NULL CHECK (item_type = ANY (ARRAY['hat'::text, 'eyewear'::text, 'toy'::text])),
  rarity text NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'hyper rare', 'legendary', 'mythical', 'impossible')),
  created_at timestamptz DEFAULT now()
);

-- Create user chests inventory table
CREATE TABLE IF NOT EXISTS user_chests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1 CHECK (quantity >= 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE rarity_loot_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_chests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rarity_loot_table (read-only, public)
CREATE POLICY "Anyone can view rarity loot table"
  ON rarity_loot_table FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_chests
CREATE POLICY "Users can view own chests"
  ON user_chests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own chests"
  ON user_chests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own chests"
  ON user_chests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
