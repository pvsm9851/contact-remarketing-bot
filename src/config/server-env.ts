import dotenv from 'dotenv';
dotenv.config();

export const SERVER_ENV = {
  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Evolution API
  EVOLUTION_API_KEY: process.env.VITE_EVOLUTION_API_KEY,
  EVOLUTION_API_URL: process.env.VITE_EVOLUTION_API_URL,

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_PRICE_PRO_ID: process.env.STRIPE_PRICE_PRO_ID,
  STRIPE_PRICE_BUSINESS_ID: process.env.STRIPE_PRICE_BUSINESS_ID,

  // Server
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development'
} as const;

// Validação dos env vars necessários no servidor
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET'
] as const;

for (const key of requiredEnvVars) {
  if (!SERVER_ENV[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
} 