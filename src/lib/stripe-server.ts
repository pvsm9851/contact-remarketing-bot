import Stripe from 'stripe';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const STRIPE_CONFIG = {
  PRICES: {
    PRO: process.env.STRIPE_PRICE_PRO_ID,
    BUSINESS: process.env.STRIPE_PRICE_BUSINESS_ID,
  },
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
}; 