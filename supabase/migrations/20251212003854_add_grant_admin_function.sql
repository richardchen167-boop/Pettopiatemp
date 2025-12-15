/*
  # Add Grant Admin Function

  1. New Functions
    - `grant_admin_privileges` - Allows super admins to grant admin privileges to other users
  
  2. Security
    - Only super admins can grant admin privileges
    - Function is SECURITY DEFINER to bypass RLS
*/

-- Function for super admins to grant admin privileges to other users
CREATE OR REPLACE FUNCTION grant_admin_privileges(
  target_user_id uuid,
  make_super_admin boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_is_super_admin boolean;
BEGIN
  -- Check if the current user is a super admin
  SELECT is_super_admin INTO current_user_is_super_admin
  FROM admin_users
  WHERE user_id = auth.uid();
  
  IF NOT COALESCE(current_user_is_super_admin, false) THEN
    RAISE EXCEPTION 'Only super admins can grant admin privileges';
  END IF;
  
  -- Grant admin privileges
  INSERT INTO admin_users (user_id, is_super_admin, granted_by)
  VALUES (target_user_id, make_super_admin, auth.uid())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    is_super_admin = make_super_admin,
    granted_by = auth.uid(),
    granted_at = now();
END;
$$;