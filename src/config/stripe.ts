export const STRIPE_CONFIG = {
  PRICES: {
    PRO: 'price_1RSOYJRHP1HTmtJCfC1AzwoX',
    BUSINESS: 'price_1RSOW3RHP1HTmtJCodOnPpo4'
  },
  SUCCESS_URL: `${window.location.origin}/dashboard?payment=success`,
  CANCEL_URL: `${window.location.origin}/dashboard?payment=cancelled`,
  WEBHOOK_URL: `${window.location.origin}/api/webhook`
}; 