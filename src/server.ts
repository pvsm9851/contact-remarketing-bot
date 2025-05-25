import express from 'express';
import cors from 'cors';
import { handleStripeWebhook } from './pages/api/stripe-webhook';
import createCheckoutRouter from './pages/api/create-checkout-session';
import cancelSubscriptionRouter from './pages/api/cancel-subscription';
import { SERVER_ENV } from './config/server-env';
import { stripe } from './lib/stripe-server';

const app = express();

// Configurar CORS
app.use(cors());

// Configurar o webhook do Stripe primeiro (precisa do raw body)
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!sig || !SERVER_ENV.STRIPE_WEBHOOK_SECRET) {
    res.status(400).send('Missing signature or webhook secret');
    return;
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      SERVER_ENV.STRIPE_WEBHOOK_SECRET
    );

    await handleStripeWebhook(event);
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook Error:', err);
    res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
});

// Depois configurar o parser JSON para as outras rotas
app.use(express.json());

// Montar rotas
app.use('/api/create-checkout-session', createCheckoutRouter);
app.use('/api/cancel-subscription', cancelSubscriptionRouter);

const port = SERVER_ENV.PORT;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 