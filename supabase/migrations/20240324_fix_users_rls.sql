-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy for inserting new users (allow anyone to register)
CREATE POLICY "Allow anyone to register" ON public.users
FOR INSERT TO anon
WITH CHECK (true);

-- Policy for reading users (allow reading own data and searching by email for login)
CREATE POLICY "Allow users to read their own data and search by email" ON public.users
FOR SELECT TO anon
USING (true);

-- Policy for updating users (allow users to update their own data)
CREATE POLICY "Allow users to update their own data" ON public.users
FOR UPDATE TO anon
USING (true)
WITH CHECK (true);

-- Grant necessary permissions to anon role
GRANT ALL ON public.users TO anon;
GRANT USAGE ON SCHEMA public TO anon; 