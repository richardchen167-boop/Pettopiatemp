/*
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
);