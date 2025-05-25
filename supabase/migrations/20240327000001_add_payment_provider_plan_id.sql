-- Add payment_provider_plan_id column to subscriptions table
ALTER TABLE public.subscriptions
ADD COLUMN payment_provider_plan_id TEXT; 