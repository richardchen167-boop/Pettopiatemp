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
