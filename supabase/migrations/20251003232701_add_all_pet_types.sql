/*
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
