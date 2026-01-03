/*
  # Fix Admin and Ban Policies Comprehensively

  The issue is that admin_users RLS policies are self-referential, causing problems
  when the is_admin() function or other operations try to check admin status.

  1. Solution
    - Use SECURITY DEFINER function for all admin checks to bypass RLS
    - Simplify admin_users policies to use the is_admin() function
    - Ensure banned_users policies work correctly with is_admin()
  
  2. Changes
    - Drop all existing admin_users policies
    - Recreate with is_admin() function
    - Ensure is_admin() function exists and works
*/

-- Recreate is_admin function to ensure it exists
CREATE OR REPLACE FUNCTION is_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = check_user_id
  );
$$;

-- Create is_super_admin function
CREATE OR REPLACE FUNCTION is_super_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = check_user_id 
    AND is_super_admin = true
  );
$$;

-- Drop ALL existing admin_users policies
DROP POLICY IF EXISTS "Admins can view admin list" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage admins" ON admin_users;
DROP POLICY IF EXISTS "Super admins can insert admins" ON admin_users;
DROP POLICY IF EXISTS "Super admins can update admins" ON admin_users;
DROP POLICY IF EXISTS "Super admins can delete admins" ON admin_users;

-- Create new admin_users policies using helper functions
CREATE POLICY "Admins can view admin list"
  ON admin_users FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Super admins can insert admins"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update admins"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete admins"
  ON admin_users FOR DELETE
  TO authenticated
  USING (is_super_admin(auth.uid()));

-- Ensure banned_users policies use is_admin() function
DROP POLICY IF EXISTS "Admins can view banned users" ON banned_users;
DROP POLICY IF EXISTS "Admins can insert banned users" ON banned_users;
DROP POLICY IF EXISTS "Admins can update banned users" ON banned_users;
DROP POLICY IF EXISTS "Admins can delete banned users" ON banned_users;

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
