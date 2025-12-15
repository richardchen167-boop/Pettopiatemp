/*
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
);