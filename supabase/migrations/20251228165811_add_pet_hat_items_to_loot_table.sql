/*
  # Add Pet Hat Items to Rarity Loot Table

  1. New Items
    - Adding 8 new hat items to the rarity_loot_table
    - Items: Burger Hat, Woman's Hat, Basketball Hat, Apple Hat, Bubble Tea Hat, Earth Hat, Hourglass Hat, Ribbon Hat
    - Distributed across various rarities: common, uncommon, rare, hyper rare, legendary
*/

INSERT INTO rarity_loot_table (item_name, item_emoji, item_type, rarity)
VALUES
  ('Burger Hat', '🍔', 'hat', 'common'),
  ('Womans Hat', '👒', 'hat', 'uncommon'),
  ('Basketball Hat', '🏀', 'hat', 'uncommon'),
  ('Apple Hat', '🍎', 'hat', 'rare'),
  ('Bubble Tea Hat', '🧋', 'hat', 'rare'),
  ('Earth Hat', '🌎', 'hat', 'hyper rare'),
  ('Hourglass Hat', '⌛', 'hat', 'legendary'),
  ('Ribbon Hat', '🎀', 'hat', 'mythical');
