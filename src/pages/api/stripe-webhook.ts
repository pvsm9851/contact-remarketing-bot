import { supabase } from '@/integrations/supabase/client';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function handleStripeWebhook(event: Stripe.Event) {
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, planId } = session.metadata || {};

        if (!userId || !planId) {
          throw new Error('Missing metadata');
        }

        // Create subscription record
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            plan_id: planId,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            payment_provider: 'stripe',
            payment_provider_subscription_id: session.subscription as string
          });

        if (subscriptionError) throw subscriptionError;

        // Create payment history record
        const { error: paymentError } = await supabase
          .from('payment_history')
          .insert({
            subscription_id: session.subscription,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            status: 'succeeded',
            provider_payment_id: session.payment_intent as string
          });

        if (paymentError) throw paymentError;
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          })
          .eq('payment_provider_subscription_id', subscription.id);

        if (error) throw error;
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        const { error } = await supabase
          .from('payment_history')
          .insert({
            subscription_id: invoice.subscription,
            amount: invoice.amount_paid / 100,
            status: 'succeeded',
            provider_payment_id: invoice.payment_intent as string
          });

        if (error) throw error;
        break;
      }
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    throw error;
  }
} 