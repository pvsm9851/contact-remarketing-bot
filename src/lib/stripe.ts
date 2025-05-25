import { loadStripe } from '@stripe/stripe-js';

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing VITE_STRIPE_PUBLIC_KEY');
}

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export const STRIPE_CONFIG = {
  PRICES: {
    PRO: import.meta.env.VITE_STRIPE_PRICE_PRO_ID,
    BUSINESS: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_ID,
  },
  SUCCESS_URL: `${window.location.origin}/payment/success`,
  CANCEL_URL: `${window.location.origin}/payment/cancel`,
}; 