/*
  # Create Admin and Ban System

  1. New Tables
    - `admin_users`
      - `user_id` (uuid, primary key, references auth.users)
      - `granted_by` (uuid, references auth.users)
      - `granted_at` (timestamp)
      - `is_super_admin` (boolean) - can manage other admins
    
    - `banned_users`
      - `user_id` (uuid, primary key, references auth.users)
      - `banned_by` (uuid, references auth.users)
      - `banned_at` (timestamp)
      - `reason` (text)
      - `is_active` (boolean) - allows temporary unbanning
  
  2. Security
    - Enable RLS on both tables
    - Admins can read admin_users table
    - Super admins can modify admin_users table
    - Admins can read and manage banned_users table
*/

CREATE TABLE IF NOT EXISTS admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamptz DEFAULT now(),
  is_super_admin boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS banned_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  banned_by uuid REFERENCES auth.users(id),
  banned_at timestamptz DEFAULT now(),
  reason text DEFAULT '',
  is_active boolean DEFAULT true
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin list"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage admins"
  ON admin_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_super_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_super_admin = true
    )
  );

CREATE POLICY "Admins can view banned users"
  ON banned_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage banned users"
  ON banned_users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update banned users"
  ON banned_users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete banned users"
  ON banned_users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );