export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    contacts: number;
    messages_per_month: number;
  };
  active: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan?: Plan;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  payment_provider: string;
  payment_provider_subscription_id?: string;
}

export interface PaymentHistory {
  id: string;
  subscription_id: string;
  amount: number;
  status: 'succeeded' | 'failed' | 'pending' | 'refunded';
  provider_payment_id?: string;
  created_at: string;
}

export interface SubscriptionContextType {
  currentPlan: Plan | null;
  subscription: Subscription | null;
  paymentHistory: PaymentHistory[];
  isLoading: boolean;
  subscribeToPlan: (planId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  updatePaymentMethod: (paymentMethodId: string) => Promise<void>;
  checkFeatureAccess: (feature: string) => boolean;
  getRemainingLimits: () => {
    contacts: number;
    messages: number;
  };
} 