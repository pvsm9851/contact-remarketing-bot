// @ts-ignore - Vite specific types
const env = import.meta.env;

export const CLIENT_ENV = {
  SUPABASE_URL: env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY,
  EVOLUTION_API_KEY: env.VITE_EVOLUTION_API_KEY,
  EVOLUTION_API_URL: env.VITE_EVOLUTION_API_URL,
  STRIPE_PUBLIC_KEY: env.VITE_STRIPE_PUBLIC_KEY,
  NODE_ENV: env.MODE || 'development'
} as const;

// Validação dos env vars necessários no cliente
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
] as const;

for (const key of requiredEnvVars) {
  if (!CLIENT_ENV[key]) {
    console.error(`Missing required environment variable: ${key}`);
  }
} 