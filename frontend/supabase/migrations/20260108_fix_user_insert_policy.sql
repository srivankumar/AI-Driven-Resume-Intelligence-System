-- Fix infinite recursion in users table RLS policy
-- Drop all existing policies that cause recursion
-- Recreate them without recursive checks

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;

-- Recreate policies without recursion
-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow new user registration (INSERT during signup)
CREATE POLICY "Allow user registration"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow admins to read all users (using a simpler check)
CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (role = 'admin' AND auth.uid() = id);
