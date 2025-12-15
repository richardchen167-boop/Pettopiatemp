/*
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
  USING (is_admin(auth.uid()));