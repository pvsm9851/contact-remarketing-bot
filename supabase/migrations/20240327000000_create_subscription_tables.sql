-- Create plans table
CREATE TABLE public.plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    interval TEXT NOT NULL CHECK (interval IN ('monthly', 'yearly')),
    features JSONB NOT NULL,
    limits JSONB NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.plans(id),
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    payment_provider TEXT NOT NULL,
    payment_provider_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create payment_history table
CREATE TABLE public.payment_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id),
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('succeeded', 'failed', 'pending', 'refunded')),
    provider_payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Plans policies
CREATE POLICY "Allow read access to active plans for all" ON public.plans
    FOR SELECT USING (active = true);

CREATE POLICY "Allow all access for service role" ON public.plans
    USING (true)
    WITH CHECK (true);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions" ON public.subscriptions
    USING (true)
    WITH CHECK (true);

-- Payment history policies
CREATE POLICY "Users can view own payment history" ON public.payment_history
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id 
            FROM public.subscriptions 
            WHERE id = payment_history.subscription_id
        )
    );

-- Create indexes
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan_id ON public.subscriptions(plan_id);
CREATE INDEX idx_payment_history_subscription_id ON public.payment_history(subscription_id);

-- Insert default plans
INSERT INTO public.plans (name, description, price, interval, features, limits, active) VALUES
(
    'Free',
    'Plano gratuito com recursos básicos',
    0,
    'monthly',
    '["Conexão com WhatsApp", "Gerenciamento de contatos", "Envio de mensagens"]'::jsonb,
    '{"contacts": 100, "messages_per_month": 500}'::jsonb,
    true
),
(
    'Pro',
    'Plano profissional com recursos avançados',
    49.90,
    'monthly',
    '["Conexão com WhatsApp", "Gerenciamento de contatos", "Envio de mensagens", "Importação CSV", "Estatísticas avançadas", "Suporte prioritário"]'::jsonb,
    '{"contacts": 1000, "messages_per_month": 5000}'::jsonb,
    true
),
(
    'Business',
    'Plano empresarial com recursos ilimitados',
    99.90,
    'monthly',
    '["Conexão com WhatsApp", "Gerenciamento de contatos", "Envio de mensagens", "Importação CSV", "Estatísticas avançadas", "Suporte prioritário", "API de integração", "Múltiplas conexões"]'::jsonb,
    '{"contacts": 5000, "messages_per_month": 50000}'::jsonb,
    true
);

-- Function to check subscription status
CREATE OR REPLACE FUNCTION check_subscription_limits()
RETURNS TRIGGER AS $$
DECLARE
    user_subscription RECORD;
    plan_limits JSONB;
    current_count INTEGER;
BEGIN
    -- Get user's active subscription
    SELECT s.*, p.limits INTO user_subscription
    FROM public.subscriptions s
    JOIN public.plans p ON s.plan_id = p.id
    WHERE s.user_id = NEW.user_id
    AND s.status = 'active'
    AND s.current_period_end > now()
    ORDER BY s.created_at DESC
    LIMIT 1;

    -- If no active subscription, use free plan limits
    IF user_subscription IS NULL THEN
        SELECT limits INTO plan_limits
        FROM public.plans
        WHERE name = 'Free'
        LIMIT 1;
    ELSE
        plan_limits := user_subscription.limits;
    END IF;

    -- Check limits based on the table being inserted into
    IF TG_TABLE_NAME = 'contacts' THEN
        SELECT COUNT(*) INTO current_count
        FROM public.contacts
        WHERE user_id = NEW.user_id;

        IF current_count >= (plan_limits->>'contacts')::integer THEN
            RAISE EXCEPTION 'Limite de contatos atingido para seu plano atual';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 