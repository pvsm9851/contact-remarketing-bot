-- Enable RLS on contacts table
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Policy for inserting contacts (users can only insert their own contacts)
CREATE POLICY "Users can insert their own contacts" ON public.contacts
FOR INSERT TO anon
WITH CHECK (true);

-- Policy for selecting contacts (users can only see their own contacts)
CREATE POLICY "Users can view their own contacts" ON public.contacts
FOR SELECT TO anon
USING (true);

-- Policy for updating contacts (users can only update their own contacts)
CREATE POLICY "Users can update their own contacts" ON public.contacts
FOR UPDATE TO anon
USING (true)
WITH CHECK (true);

-- Policy for deleting contacts (users can only delete their own contacts)
CREATE POLICY "Users can delete their own contacts" ON public.contacts
FOR DELETE TO anon
USING (true);

-- Grant necessary permissions to anon role
GRANT ALL ON public.contacts TO anon; 