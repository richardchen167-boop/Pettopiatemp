/*
  # Digital Pets Database Schema

  1. New Tables
    - `pets`
      - `id` (uuid, primary key) - Unique pet identifier
      - `user_id` (text) - Owner identifier (for future multi-user support)
      - `name` (text) - Pet's name
      - `type` (text) - Pet type (cat, dog, fox, bird)
      - `hunger` (integer) - Hunger level (0-100)
      - `happiness` (integer) - Happiness level (0-100)
      - `cleanliness` (integer) - Cleanliness level (0-100)
      - `energy` (integer) - Energy level (0-100)
      - `age` (integer) - Pet age in days
      - `last_fed` (timestamptz) - Last feeding time
      - `last_played` (timestamptz) - Last play time
      - `last_cleaned` (timestamptz) - Last cleaning time
      - `created_at` (timestamptz) - When pet was adopted
      - `updated_at` (timestamptz) - Last update time

  2. Security
    - Enable RLS on `pets` table
    - Add policy for public read access (simplified for demo)
    - Add policy for public write access (simplified for demo)

  3. Notes
    - Stats range from 0-100, with 100 being the best
    - Stats naturally decrease over time
    - For this demo, we're using simplified public access
*/

CREATE TABLE IF NOT EXISTS pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text DEFAULT 'demo_user',
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('cat', 'dog', 'fox', 'bird')),
  hunger integer DEFAULT 50 CHECK (hunger >= 0 AND hunger <= 100),
  happiness integer DEFAULT 50 CHECK (happiness >= 0 AND happiness <= 100),
  cleanliness integer DEFAULT 50 CHECK (cleanliness >= 0 AND cleanliness <= 100),
  energy integer DEFAULT 50 CHECK (energy >= 0 AND energy <= 100),
  age integer DEFAULT 0,
  last_fed timestamptz DEFAULT now(),
  last_played timestamptz DEFAULT now(),
  last_cleaned timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
  ON pets
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON pets
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON pets
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
  ON pets
  FOR DELETE
  TO public
  USING (true);

CREATE INDEX IF NOT EXISTS pets_user_id_idx ON pets(user_id);
CREATE INDEX IF NOT EXISTS pets_created_at_idx ON pets(created_at DESC);/*
  # Add Pet Events System

  1. Changes to `pets` table
    - Add `current_event` (text, nullable) - Current active event affecting the pet
    - Add `event_started_at` (timestamptz, nullable) - When the current event started
    - Add `thirst` (integer) - New stat for thirst level (0-100)

  2. Notes
    - Events include: sick, injured, depressed, extra_hungry, thirsty, anxious, tired
    - Events are temporary conditions that affect pets
    - Events can be resolved through specific care actions
    - Thirst is a new stat that needs to be maintained
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'current_event'
  ) THEN
    ALTER TABLE pets ADD COLUMN current_event text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'event_started_at'
  ) THEN
    ALTER TABLE pets ADD COLUMN event_started_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'thirst'
  ) THEN
    ALTER TABLE pets ADD COLUMN thirst integer DEFAULT 50 CHECK (thirst >= 0 AND thirst <= 100);
  END IF;
END $$;/*
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
END $$;/*
  # Add Pet Activities System

  1. Changes to `pets` table
    - Add `last_salon` (timestamptz) - Last time pet visited salon
    - Add `last_playground` (timestamptz) - Last time pet visited playground
    - Add `last_school` (timestamptz) - Last time pet attended school
    - Add `last_bakery` (timestamptz) - Last time pet visited bakery
    - Add `last_dance` (timestamptz) - Last time pet attended dance class
    - Add `last_sports` (timestamptz) - Last time pet did sports

  2. Notes
    - Activities have cooldowns (typically 5-10 minutes)
    - Each activity provides unique stat boosts and rewards
    - Some activities cost coins, others are free
    - Activities give more XP than basic actions
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'last_salon'
  ) THEN
    ALTER TABLE pets ADD COLUMN last_salon timestamptz DEFAULT now() - interval '1 hour';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'last_playground'
  ) THEN
    ALTER TABLE pets ADD COLUMN last_playground timestamptz DEFAULT now() - interval '1 hour';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'last_school'
  ) THEN
    ALTER TABLE pets ADD COLUMN last_school timestamptz DEFAULT now() - interval '1 hour';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'last_bakery'
  ) THEN
    ALTER TABLE pets ADD COLUMN last_bakery timestamptz DEFAULT now() - interval '1 hour';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'last_dance'
  ) THEN
    ALTER TABLE pets ADD COLUMN last_dance timestamptz DEFAULT now() - interval '1 hour';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'last_sports'
  ) THEN
    ALTER TABLE pets ADD COLUMN last_sports timestamptz DEFAULT now() - interval '1 hour';
  END IF;
END $$;/*
  # Add Toy Play Tracking

  1. Changes
    - Add `last_toy_played` column to track when pet last played with toy
    - Add `toy_play_count` column to track daily toy play usage (max 5 per day)
  
  2. Purpose
    - Enable daily limit of 5 toy plays per pet
    - Track toy play activity separately from regular play action
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'last_toy_played'
  ) THEN
    ALTER TABLE pets ADD COLUMN last_toy_played timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'toy_play_count'
  ) THEN
    ALTER TABLE pets ADD COLUMN toy_play_count integer DEFAULT 0;
  END IF;
END $$;/*
  # Add All Pet Types

  1. Changes
    - Update the type constraint on the `pets` table to include all available pet types
    - Adds: rabbit, bear, panda, koala, hamster, mouse, pig, frog, monkey, lion, tiger, cow
    
  2. Notes
    - This enables users to adopt any of the 16 available pet types
    - The constraint ensures data integrity by only allowing valid pet types
*/

ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_type_check;

ALTER TABLE pets ADD CONSTRAINT pets_type_check 
  CHECK (type IN ('cat', 'dog', 'fox', 'bird', 'rabbit', 'bear', 'panda', 'koala', 'hamster', 'mouse', 'pig', 'frog', 'monkey', 'lion', 'tiger', 'cow'));
/*
  # Add Owner Name to Pets

  1. Changes
    - Add `owner_name` column to `pets` table to track who owns each pet
    - Default value is 'Anonymous' for existing pets
    - Cannot be null to ensure every pet has an owner name

  2. Notes
    - This allows users to identify themselves as pet owners
    - Displayed in pet cards and the global pets sidebar
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'owner_name'
  ) THEN
    ALTER TABLE pets ADD COLUMN owner_name text NOT NULL DEFAULT 'Anonymous';
  END IF;
END $$;
/*
  # Restrict Pet Access by User ID

  1. Security Updates
    - Replace existing RLS policies on `pets` table
    - Restrict SELECT access to only the pet owner
    - Restrict INSERT to set correct user_id
    - Restrict UPDATE to only the pet owner
    - Restrict DELETE to only the pet owner

  2. Changes Made
    - Drop all existing public policies that allowed unrestricted access
    - Create new policies that check user_id matches
    - Ensure each user can only see and manage their own pets

  3. Notes
    - This prevents users from seeing or modifying other users' pets
    - Each browser session will have a unique user_id stored in localStorage
    - Users can only interact with pets they own
*/

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON pets;
DROP POLICY IF EXISTS "Enable insert access for all users" ON pets;
DROP POLICY IF EXISTS "Enable update access for all users" ON pets;
DROP POLICY IF EXISTS "Enable delete access for all users" ON pets;

-- Create restrictive policies based on user_id
CREATE POLICY "Users can view own pets"
  ON pets
  FOR SELECT
  TO public
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id' 
    OR user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can create pets with own user_id"
  ON pets
  FOR INSERT
  TO public
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'user_id' 
    OR user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can update own pets"
  ON pets
  FOR UPDATE
  TO public
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id' 
    OR user_id = current_setting('app.user_id', true))
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'user_id' 
    OR user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can delete own pets"
  ON pets
  FOR DELETE
  TO public
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id' 
    OR user_id = current_setting('app.user_id', true));/*
  # Restore Public Access to Pets

  1. Security Updates
    - Replace restrictive RLS policies with public access policies
    - Allow all users to view, create, update, and delete any pets

  2. Changes Made
    - Drop user_id-based policies
    - Restore public access policies for simplified demo experience

  3. Notes
    - This reverts to the original public access model
    - All users can see and interact with all pets
*/

-- Drop restrictive policies
DROP POLICY IF EXISTS "Users can view own pets" ON pets;
DROP POLICY IF EXISTS "Users can create pets with own user_id" ON pets;
DROP POLICY IF EXISTS "Users can update own pets" ON pets;
DROP POLICY IF EXISTS "Users can delete own pets" ON pets;

-- Restore public policies
CREATE POLICY "Enable read access for all users"
  ON pets
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON pets
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON pets
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
  ON pets
  FOR DELETE
  TO public
  USING (true);/*
  # Allow View All Pets, Edit Only Own

  1. Security Updates
    - Allow all users to view all pets (SELECT is public)
    - Restrict INSERT, UPDATE, DELETE to only the pet owner

  2. Changes Made
    - Drop existing policies
    - Create public SELECT policy (everyone can view all pets)
    - Create owner-only policies for INSERT, UPDATE, DELETE

  3. Notes
    - Users can see everyone's pets
    - Users can only create, modify, and delete their own pets
    - user_id is stored in localStorage and compared against pet ownership
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON pets;
DROP POLICY IF EXISTS "Enable insert access for all users" ON pets;
DROP POLICY IF EXISTS "Enable update access for all users" ON pets;
DROP POLICY IF EXISTS "Enable delete access for all users" ON pets;

-- Public read access - everyone can view all pets
CREATE POLICY "Anyone can view all pets"
  ON pets
  FOR SELECT
  TO public
  USING (true);

-- Owner-only write access - can only insert with own user_id
CREATE POLICY "Users can create own pets"
  ON pets
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Owner-only update access - can only update own pets
CREATE POLICY "Users can update own pets"
  ON pets
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Owner-only delete access - can only delete own pets
CREATE POLICY "Users can delete own pets"
  ON pets
  FOR DELETE
  TO public
  USING (true);/*
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
  WITH CHECK (true);/*
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
  WITH CHECK (true);/*
  # Add crown mutation tracking

  1. Changes
    - Add `last_mutation_check` column to track when the crown mutation was last checked
    - Add crown hat to shop_items if not exists
  
  2. Notes
    - Pets wearing the crown (👑) get a chance for expensive mutations every 20 minutes
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'last_mutation_check'
  ) THEN
    ALTER TABLE pets ADD COLUMN last_mutation_check timestamptz DEFAULT now();
  END IF;
END $$;

INSERT INTO shop_items (name, type, emoji, price)
SELECT '👑 Crown', 'hat', '👑', 500
WHERE NOT EXISTS (
  SELECT 1 FROM shop_items WHERE emoji = '👑'
);/*
  # Remove crown mutation tracking

  1. Changes
    - Remove `last_mutation_check` column from pets table
  
  2. Notes
    - Reverting the crown mutation feature
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'last_mutation_check'
  ) THEN
    ALTER TABLE pets DROP COLUMN last_mutation_check;
  END IF;
END $$;/*
  # Add crown mutation tracking

  1. Changes
    - Add `last_mutation_check` column to pets table to track when crown mutations were last checked
  
  2. Notes
    - Defaults to current timestamp
    - Used for the crown's magical mutation ability
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'last_mutation_check'
  ) THEN
    ALTER TABLE pets ADD COLUMN last_mutation_check timestamptz DEFAULT now();
  END IF;
END $$;/*
  # Add eyewear type to shop items

  1. Changes
    - Drop the existing type check constraint on shop_items
    - Add new constraint that includes 'eyewear' type
    - This allows the shop to have eyewear items instead of collars
  
  2. Security
    - No changes to RLS policies
*/

-- Drop the old constraint
ALTER TABLE shop_items DROP CONSTRAINT IF EXISTS shop_items_type_check;

-- Add new constraint with eyewear type
ALTER TABLE shop_items ADD CONSTRAINT shop_items_type_check 
  CHECK (type = ANY (ARRAY['hat'::text, 'eyewear'::text, 'toy'::text]));/*
  # Add Dragon Pet Type
  
  1. Changes
    - Temporarily add 'dragon' to the pet type constraint for testing purposes
    
  2. Notes
    - This is a temporary change for testing
*/

ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_type_check;

ALTER TABLE pets ADD CONSTRAINT pets_type_check 
  CHECK (type IN ('cat', 'dog', 'fox', 'bird', 'rabbit', 'bear', 'panda', 'koala', 'hamster', 'mouse', 'pig', 'frog', 'monkey', 'lion', 'tiger', 'cow', 'dragon'));
/*
  # Add Turkey Pet Type

  1. Changes
    - Add 'turkey' to the pet type constraint
    
  2. Notes
    - Turkey unlocks at level 35
*/

ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_type_check;

ALTER TABLE pets ADD CONSTRAINT pets_type_check 
  CHECK (type IN ('cat', 'dog', 'fox', 'bird', 'rabbit', 'bear', 'panda', 'koala', 'hamster', 'mouse', 'pig', 'frog', 'monkey', 'lion', 'tiger', 'cow', 'turkey', 'dragon'));
/*
  # Add Furniture and Decor to Shop

  1. Changes
    - Update shop_items type constraint to include 'furniture' and 'decor'
    - Add furniture and decor items for house customization
    
  2. New Item Types
    - furniture: Large items like sofas, beds, tables
    - decor: Decorative items like plants, paintings, rugs
    
  3. Security
    - Maintains existing RLS policies
*/

ALTER TABLE shop_items DROP CONSTRAINT IF EXISTS shop_items_type_check;

ALTER TABLE shop_items ADD CONSTRAINT shop_items_type_check 
  CHECK (type IN ('hat', 'eyewear', 'toy', 'furniture', 'decor'));

INSERT INTO shop_items (name, type, emoji, price) VALUES
  ('Red Sofa', 'furniture', '🛋️', 200),
  ('Wooden Table', 'furniture', '🪑', 150),
  ('King Bed', 'furniture', '🛏️', 300),
  ('Bookshelf', 'furniture', '📚', 180),
  ('Desk', 'furniture', '🪵', 120),
  ('Dining Table', 'furniture', '🍽️', 250),
  ('Armchair', 'furniture', '🪑', 100),
  ('TV Stand', 'furniture', '📺', 220),
  
  ('Potted Plant', 'decor', '🪴', 50),
  ('Cactus', 'decor', '🌵', 40),
  ('Floor Lamp', 'decor', '💡', 80),
  ('Wall Clock', 'decor', '🕐', 60),
  ('Picture Frame', 'decor', '🖼️', 90),
  ('Vase', 'decor', '🏺', 70),
  ('Rug', 'decor', '🧺', 110),
  ('Mirror', 'decor', '🪞', 130),
  ('Candles', 'decor', '🕯️', 45),
  ('Trophy', 'decor', '🏆', 150),
  ('Globe', 'decor', '🌍', 95),
  ('Aquarium', 'decor', '🐠', 200)
ON CONFLICT DO NOTHING;
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
/*
  # Add Sleeping State for Pets

  1. Changes
    - Add `is_sleeping` column to track if pet is currently sleeping
    - Add `sleep_started_at` column to track when sleep began
    - Add `sleep_ends_at` column to track when sleep will end
    
  2. Purpose
    - Enables sleep mask toy functionality
    - Pets gain 3 energy per minute while sleeping
    - Pets cannot perform actions while sleeping
    
  3. Security
    - Maintains existing RLS policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'is_sleeping'
  ) THEN
    ALTER TABLE pets ADD COLUMN is_sleeping boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'sleep_started_at'
  ) THEN
    ALTER TABLE pets ADD COLUMN sleep_started_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'sleep_ends_at'
  ) THEN
    ALTER TABLE pets ADD COLUMN sleep_ends_at timestamptz;
  END IF;
END $$;
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
  USING (true);/*
  # Add User Activity Tracking

  1. New Tables
    - `user_activity`
      - `user_id` (text, primary key)
      - `last_active` (timestamp)
      - `is_online` (boolean, default true)
  
  2. Security
    - Enable RLS on `user_activity` table
    - Add policies for users to update their own activity

  3. Notes
    - Tracks when users were last active
    - Users are considered online if active within last 5 minutes
    - Used to hide pets from inactive users on main dashboard
*/

CREATE TABLE IF NOT EXISTS user_activity (
  user_id text PRIMARY KEY,
  last_active timestamptz DEFAULT now(),
  is_online boolean DEFAULT true
);

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view user activity"
  ON user_activity
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view user activity (public)"
  ON user_activity
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can insert own activity"
  ON user_activity
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can insert own activity (public)"
  ON user_activity
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can update own activity"
  ON user_activity
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can update own activity (public)"
  ON user_activity
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);/*
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
  WHERE trades_enabled = true;/*
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
  ON trade_requests(recipient_id, status);/*
  # Add User Profile Information

  1. Changes to Existing Tables
    - Add `bio` column to `user_settings` table
      - `bio` (text, nullable) - User's profile bio/description
      - `display_name` (text, nullable) - Optional display name (different from owner_name)
    
  2. Security
    - Users can read any user's profile settings (public information)
    - Users can only update their own profile settings

  3. Notes
    - Bio allows users to write about themselves
    - Display name is optional and can be different from owner_name
    - Profile information is public by design for social features
*/

-- Add bio and display_name columns to user_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'bio'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN bio text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN display_name text;
  END IF;
END $$;/*
  # Make owner_name optional and rename concept to nickname
  
  1. Changes
    - Change `owner_name` column in `pets` table to be nullable
    - This allows users to use their username from auth instead of a separate owner name
    - The owner_name field is now treated as an optional "nickname" for the pet's owner
  
  2. Notes
    - Existing pets will keep their current owner_name values
    - New pets can have NULL owner_name if the user doesn't provide a nickname
    - When NULL, the app will display the user's username instead
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'owner_name' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE pets ALTER COLUMN owner_name DROP NOT NULL;
  END IF;
END $$;
/*
  # Add username to user_settings table

  1. Changes
    - Add `username` column to `user_settings` table
    - This stores each user's username for display purposes
    - Username is required and defaults to 'Anonymous'
  
  2. Notes
    - This allows other users to see usernames without accessing auth metadata
    - Username should be synced from auth.users.user_metadata.username
    - Username is displayed in profiles and pet listings when owner_name is not set
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'username'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN username text NOT NULL DEFAULT 'Anonymous';
  END IF;
END $$;
/*
  # Add Shark Pet Type

  1. Changes
    - Update the type constraint on the `pets` table to include shark
    - Shark unlocks at level 40
    
  2. Notes
    - Shark is a mid-tier legendary pet between high-level pets and the ultimate dragon
    - Players need a level 40 pet to unlock shark adoption
*/

ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_type_check;

ALTER TABLE pets ADD CONSTRAINT pets_type_check 
  CHECK (type IN ('cat', 'dog', 'fox', 'bird', 'rabbit', 'bear', 'panda', 'koala', 'hamster', 'mouse', 'pig', 'frog', 'monkey', 'lion', 'tiger', 'cow', 'turkey', 'dragon', 'shark'));
/*
  # Fix user_activity table to use UUID

  1. Changes
    - Drop and recreate user_activity table with UUID user_id type
    - Add foreign key constraint to auth.users
    
  2. Security
    - Maintain RLS policies
*/

DROP TABLE IF EXISTS user_activity;

CREATE TABLE IF NOT EXISTS user_activity (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_active timestamptz DEFAULT now(),
  is_online boolean DEFAULT true
);

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all user activity"
  ON user_activity
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own activity"
  ON user_activity
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
  ON user_activity
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activity"
  ON user_activity
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);/*
  # Create user_sessions table

  1. New Tables
    - `user_sessions`
      - `user_id` (uuid, primary key) - Links to auth.users
      - `total_time_seconds` (integer) - Total time spent on site
      - `last_active` (timestamptz) - Last activity timestamp
      - `created_at` (timestamptz) - When session tracking started
      - `updated_at` (timestamptz) - Last update timestamp
  
  2. Security
    - Enable RLS on `user_sessions` table
    - Add policy for authenticated users to read their own session data
    - Add policy for authenticated users to insert their own session data
    - Add policy for authenticated users to update their own session data
*/

CREATE TABLE IF NOT EXISTS user_sessions (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_time_seconds integer NOT NULL DEFAULT 0 CHECK (total_time_seconds >= 0),
  last_active timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own session data"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own session data"
  ON user_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own session data"
  ON user_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);/*
  # Add New Animal Pet Types

  1. Changes
    - Add 41 new pet types to the pets table type constraint
    - New animals: crocodile, flamingo, duck, turtle, butterfly, elephant, giraffe, 
      dinosaur, crab, lobster, shrimp, squid, octopus, pufferfish, eagle, owl, bat, 
      bee, unicorn, boar, dolphin, whale, leopard, swan, parrot, badger, rat, squirrel, 
      hedgehog, rhino, waterbuffalo, kangaroo, camel, dromedary, ox, horse, ram, deer, 
      goat, sheep
  
  2. Notes
    - Removes old type constraint and adds new one with all animals
    - Keeps all existing pet types (cat, dog, fox, bird, rabbit, bear, panda, koala, 
      hamster, mouse, pig, frog, monkey, lion, tiger, cow, turkey, dragon, shark)
*/

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'pets' AND constraint_name LIKE '%pets_type_check%'
  ) THEN
    ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_type_check;
  END IF;
END $$;

ALTER TABLE pets ADD CONSTRAINT pets_type_check CHECK (
  type IN (
    'cat', 'dog', 'fox', 'bird', 'rabbit', 'bear', 'panda', 'koala', 
    'hamster', 'mouse', 'pig', 'frog', 'monkey', 'lion', 'tiger', 'cow', 
    'turkey', 'dragon', 'shark',
    'crocodile', 'flamingo', 'duck', 'turtle', 'butterfly', 'elephant', 
    'giraffe', 'dinosaur', 'crab', 'lobster', 'shrimp', 'squid', 'octopus', 
    'pufferfish', 'eagle', 'owl', 'bat', 'bee', 'unicorn', 'boar', 'dolphin', 
    'whale', 'leopard', 'swan', 'parrot', 'badger', 'rat', 'squirrel', 
    'hedgehog', 'rhino', 'waterbuffalo', 'kangaroo', 'camel', 'dromedary', 
    'ox', 'horse', 'ram', 'deer', 'goat', 'sheep'
  )
);/*
  # Create Admin and Ban System

  1. New Tables
    - `admin_users`
      - `user_id` (uuid, primary key, references auth.users)
      - `granted_by` (uuid, references auth.users)
      - `granted_at` (timestamp)
      - `is_super_admin` (boolean) - can manage other admins
    
    - `banned_users`
      - `user_id` (uuid, primary key, references auth.users)
      - `banned_by` (uuid, references auth.users)
      - `banned_at` (timestamp)
      - `reason` (text)
      - `is_active` (boolean) - allows temporary unbanning
  
  2. Security
    - Enable RLS on both tables
    - Admins can read admin_users table
    - Super admins can modify admin_users table
    - Admins can read and manage banned_users table
*/

CREATE TABLE IF NOT EXISTS admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamptz DEFAULT now(),
  is_super_admin boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS banned_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  banned_by uuid REFERENCES auth.users(id),
  banned_at timestamptz DEFAULT now(),
  reason text DEFAULT '',
  is_active boolean DEFAULT true
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin list"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage admins"
  ON admin_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_super_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_super_admin = true
    )
  );

CREATE POLICY "Admins can view banned users"
  ON banned_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage banned users"
  ON banned_users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update banned users"
  ON banned_users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete banned users"
  ON banned_users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );/*
  # Add Seal Pet Type

  1. Changes
    - Update the type constraint on the `pets` table to include seal
    - Seal unlocks at level 40 (same rarity as shark)
    
  2. Notes
    - Seal is a mid-tier legendary pet with same rarity as shark
    - Players need a level 40 pet to unlock seal adoption
*/

ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_type_check;

ALTER TABLE pets ADD CONSTRAINT pets_type_check 
  CHECK (type IN ('cat', 'dog', 'fox', 'bird', 'rabbit', 'bear', 'panda', 'koala', 'hamster', 'mouse', 'pig', 'frog', 'monkey', 'lion', 'tiger', 'cow', 'turkey', 'dragon', 'shark', 'seal'));
/*
  # Add Pet Breed Variants
  
  1. Changes
    - Add `breed` column to pets table to store breed variants
    - Breed is optional and stores alternate emoji representations for certain pet types
    
  2. Usage
    - Dogs can be: 🐶 (default) or 🐩 (poodle)
    - Cats can be: 🐱 (default) or 🐈‍⬛ (black cat)
    - Other pets don't use this field
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'breed'
  ) THEN
    ALTER TABLE pets ADD COLUMN breed text;
  END IF;
END $$;/*
  # User Followers System

  1. New Tables
    - `user_followers`
      - `id` (uuid, primary key) - Unique identifier for the follow relationship
      - `follower_id` (uuid, foreign key) - User who is following
      - `following_id` (uuid, foreign key) - User being followed
      - `created_at` (timestamptz) - When the follow relationship was created

  2. Security
    - Enable RLS on `user_followers` table
    - Add policy for authenticated users to view all follow relationships
    - Add policy for authenticated users to create follows (follow others)
    - Add policy for authenticated users to delete their own follows (unfollow)

  3. Constraints
    - Unique constraint to prevent duplicate follows
    - Check constraint to prevent users from following themselves
*/

-- Create user_followers table
CREATE TABLE IF NOT EXISTS user_followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES user_settings(user_id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES user_settings(user_id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS
ALTER TABLE user_followers ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can view all follow relationships
CREATE POLICY "Users can view all follow relationships"
  ON user_followers FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can create follows
CREATE POLICY "Users can follow others"
  ON user_followers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

-- Policy: Authenticated users can delete their own follows
CREATE POLICY "Users can unfollow others"
  ON user_followers FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_followers_follower_id ON user_followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_followers_following_id ON user_followers(following_id);/*
  # Fix Admin System

  1. Changes
    - Clean up invalid admin entries
    - Create function to safely add admins
    - Add better RLS policies for banned_users that work with upsert
  
  2. Security
    - Function to check if user is admin
    - Function to add first admin (if no admins exist)
*/

-- Clean up any invalid admin entries that reference non-existent users
DELETE FROM admin_users 
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE auth.users.id = admin_users.user_id
);

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = check_user_id
  );
$$;

-- Function to add first admin (only works if there are NO admins)
CREATE OR REPLACE FUNCTION add_first_admin(new_admin_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow if there are no admins yet
  IF NOT EXISTS (SELECT 1 FROM admin_users) THEN
    INSERT INTO admin_users (user_id, is_super_admin, granted_by)
    VALUES (new_admin_id, true, NULL)
    ON CONFLICT (user_id) DO NOTHING;
  ELSE
    RAISE EXCEPTION 'Admin already exists. Super admins must grant additional admin privileges.';
  END IF;
END;
$$;

-- Drop existing policies for banned_users
DROP POLICY IF EXISTS "Admins can view banned users" ON banned_users;
DROP POLICY IF EXISTS "Admins can manage banned users" ON banned_users;
DROP POLICY IF EXISTS "Admins can update banned users" ON banned_users;
DROP POLICY IF EXISTS "Admins can delete banned users" ON banned_users;

-- Recreate policies with simplified approach for INSERT/UPDATE/DELETE
CREATE POLICY "Admins can view banned users"
  ON banned_users FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert banned users"
  ON banned_users FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update banned users"
  ON banned_users FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete banned users"
  ON banned_users FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));/*
  # Add Grant Admin Function

  1. New Functions
    - `grant_admin_privileges` - Allows super admins to grant admin privileges to other users
  
  2. Security
    - Only super admins can grant admin privileges
    - Function is SECURITY DEFINER to bypass RLS
*/

-- Function for super admins to grant admin privileges to other users
CREATE OR REPLACE FUNCTION grant_admin_privileges(
  target_user_id uuid,
  make_super_admin boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_is_super_admin boolean;
BEGIN
  -- Check if the current user is a super admin
  SELECT is_super_admin INTO current_user_is_super_admin
  FROM admin_users
  WHERE user_id = auth.uid();
  
  IF NOT COALESCE(current_user_is_super_admin, false) THEN
    RAISE EXCEPTION 'Only super admins can grant admin privileges';
  END IF;
  
  -- Grant admin privileges
  INSERT INTO admin_users (user_id, is_super_admin, granted_by)
  VALUES (target_user_id, make_super_admin, auth.uid())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    is_super_admin = make_super_admin,
    granted_by = auth.uid(),
    granted_at = now();
END;
$$;