import { CLIENT_ENV } from './client-env';

export const STRIPE_CONFIG = {
  PRICES: {
    PRO: 'price_1RSOYJRHP1HTmtJCfC1AzwoX',
    BUSINESS: 'price_1RSOW3RHP1HTmtJCodOnPpo4'
  },
  SUCCESS_URL: `${window.location.origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
  CANCEL_URL: `${window.location.origin}/dashboard?payment=cancelled`,
  WEBHOOK_URL: '/webhook'
}; 