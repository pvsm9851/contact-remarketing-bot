-- Drop existing policies
DROP POLICY IF EXISTS "Allow anyone to register" ON public.users;
DROP POLICY IF EXISTS "Allow users to read their own data and search by email" ON public.users;
DROP POLICY IF EXISTS "Allow users to update their own data" ON public.users;

-- Create new policies for both anon and authenticated roles
CREATE POLICY "Allow anyone to register"
ON public.users
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow users to read their own data"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid()::text = id::text);

CREATE POLICY "Allow users to update their own data"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid()::text = id::text)
WITH CHECK (auth.uid()::text = id::text);

-- Grant necessary permissions
GRANT ALL ON public.users TO authenticated; 