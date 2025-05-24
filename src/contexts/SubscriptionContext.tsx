import React, { createContext, useContext, useState, useEffect } from 'react';
import { Plan, Subscription, PaymentHistory, SubscriptionContextType } from '@/types/subscription';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import { PostgrestError } from '@supabase/supabase-js';
import { STRIPE_CONFIG } from '@/config/stripe';
import { notify } from '@/services/notification';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { auth } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current subscription and plan
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!auth.user) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch active subscription
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('*, plan:plans(*)')
          .eq('user_id', auth.user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Se não houver erro mas também não houver dados, significa que não há assinatura ativa
        if (!subscriptionError && !subscriptionData) {
          // Buscar plano gratuito
          const { data: freePlan, error: planError } = await supabase
            .from('plans')
            .select()
            .eq('name', 'Free')
            .single();

          if (planError) throw planError;
          
          setCurrentPlan(freePlan);
          setSubscription(null);
          setPaymentHistory([]);
          setIsLoading(false);
          return;
        }

        if (subscriptionError) throw subscriptionError;

        // Se chegou aqui, temos uma assinatura ativa
        setSubscription(subscriptionData);
        setCurrentPlan(subscriptionData.plan as Plan);

        // Fetch payment history only if there's an active subscription
        const { data: payments, error: paymentsError } = await supabase
          .from('payment_history')
          .select()
          .eq('subscription_id', subscriptionData.id)
          .order('created_at', { ascending: false });

        if (paymentsError) throw paymentsError;
        setPaymentHistory(payments || []);
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        // Em caso de erro, definir plano gratuito como fallback
        const { data: freePlan } = await supabase
          .from('plans')
          .select()
          .eq('name', 'Free')
          .single();
          
        setCurrentPlan(freePlan);
        setSubscription(null);
        setPaymentHistory([]);
        toast.error('Erro ao carregar dados da assinatura');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [auth.user]);

  const subscribeToPlan = async (planId: string) => {
    if (!auth.user) return;

    try {
      const priceId = planId === 'pro' ? STRIPE_CONFIG.PRICES.PRO : STRIPE_CONFIG.PRICES.BUSINESS;
      
      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${import.meta.env.VITE_STRIPE_SECRET_KEY}`
        },
        body: new URLSearchParams({
          'line_items[0][price]': priceId,
          'line_items[0][quantity]': '1',
          'mode': 'subscription',
          'success_url': STRIPE_CONFIG.SUCCESS_URL,
          'cancel_url': STRIPE_CONFIG.CANCEL_URL,
          'metadata[userId]': auth.user.id,
          'metadata[planId]': planId,
          'customer_email': auth.user.email || ''
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const session = await response.json();
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      notify.error('Erro ao processar assinatura', {
        description: 'Por favor, tente novamente mais tarde.',
        duration: 5000
      });
      throw error;
    }
  };

  const cancelSubscription = async () => {
    if (!subscription) return;

    const loadingToast = notify.loading('Cancelando assinatura...', {
      duration: 0 // Infinito até ser atualizado
    });

    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.payment_provider_subscription_id,
        }),
      });

      if (!response.ok) throw new Error('Failed to cancel subscription');

      // Update subscription in database
      const { error } = await supabase
        .from('subscriptions')
        .update({ cancel_at_period_end: true })
        .eq('id', subscription.id);

      if (error) throw error;

      setSubscription({
        ...subscription,
        cancel_at_period_end: true,
      });

      notify.dismiss(loadingToast);
      notify.success('Assinatura cancelada com sucesso', {
        description: 'Você terá acesso até o final do período atual.'
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      notify.dismiss(loadingToast);
      notify.error('Erro ao cancelar assinatura', {
        description: 'Por favor, tente novamente mais tarde.'
      });
    }
  };

  const updatePaymentMethod = async (paymentMethodId: string) => {
    if (!subscription) return;

    try {
      const response = await fetch('/api/update-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.payment_provider_subscription_id,
          paymentMethodId,
        }),
      });

      if (!response.ok) throw new Error('Failed to update payment method');

      toast.success('Método de pagamento atualizado com sucesso');
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast.error('Erro ao atualizar método de pagamento');
    }
  };

  const checkFeatureAccess = (feature: string): boolean => {
    if (!currentPlan) return false;
    return currentPlan.features.includes(feature);
  };

  const getRemainingLimits = () => {
    if (!currentPlan || !subscription) {
      return {
        contacts: 0,
        messages: 0,
      };
    }

    // Implement logic to calculate remaining limits based on usage
    return {
      contacts: currentPlan.limits.contacts,
      messages: currentPlan.limits.messages_per_month,
    };
  };

  return (
    <SubscriptionContext.Provider
      value={{
        currentPlan,
        subscription,
        paymentHistory,
        isLoading,
        subscribeToPlan,
        cancelSubscription,
        updatePaymentMethod,
        checkFeatureAccess,
        getRemainingLimits,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
} 