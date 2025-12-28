/*
  # Fix Rarity Loot Table
  
  Make item_id optional since we're storing items that don't exist in other tables
*/

DROP TABLE IF EXISTS rarity_loot_table;

CREATE TABLE rarity_loot_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name text NOT NULL,
  item_emoji text NOT NULL,
  item_type text NOT NULL CHECK (item_type = ANY (ARRAY['hat'::text, 'eyewear'::text, 'toy'::text])),
  rarity text NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'hyper rare', 'legendary', 'mythical', 'impossible')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rarity_loot_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rarity loot table"
  ON rarity_loot_table FOR SELECT
  TO authenticated
  USING (true);
