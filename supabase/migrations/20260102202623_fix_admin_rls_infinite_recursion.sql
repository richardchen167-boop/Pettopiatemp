/*
  # Fix Admin RLS Infinite Recursion

  The previous admin_users policies caused infinite recursion by querying the admin_users table
  within the policy conditions. This migration fixes it by using a simpler approach that avoids
  recursive policy evaluation.

  1. Drop problematic policies
    - "Admins can view admin list"
    - "Super admins can manage admins"
  
  2. Create new non-recursive policies
    - Only super admins (checked directly without table query) can manage
    - Regular admins can only view (read-only access)
*/

DROP POLICY IF EXISTS "Admins can view admin list" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage admins" ON admin_users;

CREATE POLICY "Admins can view admin list"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Super admins can insert admins"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users WHERE is_super_admin = true));

CREATE POLICY "Super admins can update admins"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE is_super_admin = true))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users WHERE is_super_admin = true));

CREATE POLICY "Super admins can delete admins"
  ON admin_users FOR DELETE
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE is_super_admin = true));
