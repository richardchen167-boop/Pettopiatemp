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
CREATE INDEX IF NOT EXISTS pets_created_at_idx ON pets(created_at DESC);