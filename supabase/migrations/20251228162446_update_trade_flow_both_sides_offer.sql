/*
  # Update Trade Flow - Both Sides Offer Items

  1. Changes
    - Add sender_confirmed and recipient_confirmed columns to track mutual agreement
    - Remove sender_pet_id and recipient_pet_id (no longer used)
    - Trade items now added after request creation, not during

  2. Schema Updates
    - trade_requests: Add sender_confirmed, recipient_confirmed boolean fields
    - Items added via trade_items after both players agree

  3. Flow
    - User sends empty trade request
    - Recipient accepts to enter negotiation modal
    - Both add items they're offering
    - Both must confirm before final acceptance
*/

DO $$
BEGIN
  -- Add confirmation columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trade_requests' AND column_name = 'sender_confirmed'
  ) THEN
    ALTER TABLE trade_requests ADD COLUMN sender_confirmed BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trade_requests' AND column_name = 'recipient_confirmed'
  ) THEN
    ALTER TABLE trade_requests ADD COLUMN recipient_confirmed BOOLEAN DEFAULT false;
  END IF;
END $$;
