import { supabase } from '@/integrations/supabase/client-server';
import { stripe } from '@/lib/stripe-server';
import { SERVER_ENV } from '@/config/server-env';
import type Stripe from 'stripe';

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  payment_provider: string;
  payment_provider_subscription_id: string;
  cancel_at_period_end: boolean;
}

export async function handleStripeWebhook(event: Stripe.Event) {
  try {
    console.log('Processing webhook event:', event.type);
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session);
        
        const { userId, planId } = session.metadata || {};
        console.log('Metadata:', { userId, planId });

        if (!userId || !planId) {
          throw new Error('Missing metadata: userId or planId');
        }

        // Mapear o ID do plano do Stripe para o nome do plano
        const stripePlanId = planId === 'pro' ? SERVER_ENV.STRIPE_PRICE_PRO_ID : SERVER_ENV.STRIPE_PRICE_BUSINESS_ID;
        const planName = planId === 'pro' ? 'Pro' : 'Business';

        // Buscar plano pelo nome
        const { data: planData, error: planError } = await supabase
          .from('plans')
          .select('*')
          .eq('name', planName)
          .single();

        if (planError || !planData) {
          console.error('Plan fetch error:', planError);
          throw new Error(`Plan not found: ${planName}`);
        }

        console.log('Plan data:', planData);

        // Criar ou atualizar assinatura
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            plan_id: planData.id,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            payment_provider: 'stripe',
            payment_provider_subscription_id: session.subscription,
            payment_provider_plan_id: stripePlanId, // Adicionar ID do plano do Stripe
            cancel_at_period_end: false
          }, {
            onConflict: 'user_id'
          })
          .select();

        if (subscriptionError || !subscriptionData?.[0]) {
          console.error('Subscription creation error:', subscriptionError);
          throw new Error('Failed to create subscription');
        }

        console.log('Subscription created:', subscriptionData[0]);

        // Registrar pagamento
        const { error: paymentError } = await supabase
          .from('payment_history')
          .insert({
            subscription_id: subscriptionData[0].id,
            amount: planData.price,
            status: 'succeeded',
            provider_payment_id: session.payment_intent
          });

        if (paymentError) {
          console.error('Payment history creation error:', paymentError);
          throw paymentError;
        }

        console.log('Payment history created successfully');
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription updated:', subscription);
        
        // Atualizar status da assinatura
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end
          })
          .eq('payment_provider_subscription_id', subscription.id);

        if (error) {
          console.error('Subscription update error:', error);
          throw error;
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Invoice payment succeeded:', invoice);
        
        // Buscar assinatura relacionada
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('payment_provider_subscription_id', invoice.subscription)
          .single();

        if (subscriptionError) {
          console.error('Subscription fetch error:', subscriptionError);
          throw subscriptionError;
        }

        // Registrar pagamento
        const { error: paymentError } = await supabase
          .from('payment_history')
          .insert({
            subscription_id: subscriptionData.id,
            amount: invoice.amount_paid / 100,
            status: 'succeeded',
            provider_payment_id: invoice.payment_intent
          });

        if (paymentError) {
          console.error('Payment history creation error:', paymentError);
          throw paymentError;
        }

        // Atualizar período da assinatura
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            current_period_start: new Date(invoice.period_start * 1000).toISOString(),
            current_period_end: new Date(invoice.period_end * 1000).toISOString(),
            status: 'active'
          })
          .eq('id', subscriptionData.id);

        if (updateError) {
          console.error('Subscription period update error:', updateError);
          throw updateError;
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Invoice payment failed:', invoice);
        
        // Buscar assinatura relacionada
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('payment_provider_subscription_id', invoice.subscription)
          .single();

        if (subscriptionError) {
          console.error('Subscription fetch error:', subscriptionError);
          throw subscriptionError;
        }

        // Registrar falha no pagamento
        const { error: paymentError } = await supabase
          .from('payment_history')
          .insert({
            subscription_id: subscriptionData.id,
            amount: invoice.amount_due / 100,
            status: 'failed',
            provider_payment_id: invoice.payment_intent
          });

        if (paymentError) {
          console.error('Payment history creation error:', paymentError);
          throw paymentError;
        }

        // Atualizar status da assinatura
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: 'past_due'
          })
          .eq('id', subscriptionData.id);

        if (updateError) {
          console.error('Subscription status update error:', updateError);
          throw updateError;
        }
        break;
      }
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    throw error;
  }
} 