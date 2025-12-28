/*
  # Fix Banned Users RLS Policies

  The issue is that the INSERT policy for banned_users requires WITH CHECK to pass,
  but when using UPSERT, RLS evaluation can be strict about permissions.
  
  1. Fixed Policies
    - Admins can insert banned users (explicit INSERT policy)
    - Admins can update banned users (explicit UPDATE policy)
    - Admins can view banned users (SELECT policy)
    - Admins can delete banned users (DELETE policy)
  
  2. Security
    - All operations restricted to authenticated admin users
    - Uses is_admin() function to verify admin status
*/

DROP POLICY IF EXISTS "Admins can insert banned users" ON banned_users;
DROP POLICY IF EXISTS "Admins can update banned users" ON banned_users;
DROP POLICY IF EXISTS "Admins can view banned users" ON banned_users;
DROP POLICY IF EXISTS "Admins can delete banned users" ON banned_users;

CREATE POLICY "Admins can view banned users"
  ON banned_users
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert banned users"
  ON banned_users
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update banned users"
  ON banned_users
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete banned users"
  ON banned_users
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));
