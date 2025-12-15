/*
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
