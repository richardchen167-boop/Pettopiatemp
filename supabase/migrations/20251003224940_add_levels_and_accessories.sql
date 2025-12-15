/*
  # Add Leveling System and Pet Accessories

  1. Changes to `pets` table
    - Add `level` (integer) - Pet's current level (starts at 1)
    - Add `xp` (integer) - Current experience points
    - Add `coins` (integer) - Currency for buying items
    - Add `accessories` (jsonb) - Equipped accessories (hat, collar, toy)

  2. New Tables
    - `shop_items`
      - `id` (uuid, primary key) - Item identifier
      - `name` (text) - Item name
      - `type` (text) - Item type (hat, collar, toy)
      - `emoji` (text) - Visual representation
      - `price` (integer) - Cost in coins
      - `created_at` (timestamptz) - When item was added

  3. Security
    - Enable RLS on `shop_items` table
    - Add read-only policy for shop items

  4. Notes
    - Pets gain XP from actions (feed, play, clean)
    - Level up every 100 XP
    - Earn coins from actions and leveling up
    - Accessories are purely cosmetic
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'level'
  ) THEN
    ALTER TABLE pets ADD COLUMN level integer DEFAULT 1 CHECK (level >= 1);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'xp'
  ) THEN
    ALTER TABLE pets ADD COLUMN xp integer DEFAULT 0 CHECK (xp >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'coins'
  ) THEN
    ALTER TABLE pets ADD COLUMN coins integer DEFAULT 50 CHECK (coins >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'accessories'
  ) THEN
    ALTER TABLE pets ADD COLUMN accessories jsonb DEFAULT '{"hat": null, "collar": null, "toy": null}'::jsonb;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS shop_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('hat', 'collar', 'toy')),
  emoji text NOT NULL,
  price integer NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
  ON shop_items
  FOR SELECT
  TO public
  USING (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM shop_items LIMIT 1) THEN
    INSERT INTO shop_items (name, type, emoji, price) VALUES
      ('Party Hat', 'hat', '🎉', 50),
      ('Crown', 'hat', '👑', 100),
      ('Chef Hat', 'hat', '👨‍🍳', 75),
      ('Wizard Hat', 'hat', '🧙', 150),
      ('Pirate Hat', 'hat', '🏴‍☠️', 125),
      ('Cowboy Hat', 'hat', '🤠', 80),
      
      ('Red Collar', 'collar', '🔴', 30),
      ('Blue Collar', 'collar', '🔵', 30),
      ('Gold Chain', 'collar', '🥇', 120),
      ('Bow Tie', 'collar', '🎀', 60),
      ('Diamond Collar', 'collar', '💎', 200),
      ('Bell Collar', 'collar', '🔔', 45),
      
      ('Ball', 'toy', '⚽', 25),
      ('Bone', 'toy', '🦴', 40),
      ('Yarn', 'toy', '🧶', 35),
      ('Frisbee', 'toy', '🥏', 50),
      ('Squeaky Toy', 'toy', '🎾', 30),
      ('Feather', 'toy', '🪶', 20);
  END IF;
END $$;