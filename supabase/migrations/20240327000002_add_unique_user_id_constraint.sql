-- Add unique constraint on user_id in subscriptions table
ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id); 