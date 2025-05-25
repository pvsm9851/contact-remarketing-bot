import { stripe } from '@/lib/stripe-server';
import { SERVER_ENV } from '@/config/server-env';
import { Request, Response, Router } from 'express';

interface CheckoutBody {
  planId: string;
  userId: string;
  email: string;
}

const router = Router();

const createCheckoutSession = async (
  req: Request<{}, any, CheckoutBody>,
  res: Response
): Promise<void> => {
  try {
    const { planId, userId, email } = req.body;

    if (!planId || !userId || !email) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const priceId = planId === 'pro' ? SERVER_ENV.STRIPE_PRICE_PRO_ID : SERVER_ENV.STRIPE_PRICE_BUSINESS_ID;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/payment/success`,
      cancel_url: `${req.headers.origin}/payment/cancel`,
      metadata: {
        userId,
        planId,
      },
      customer_email: email,
    });

    res.json({ sessionId: session.id });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ error: 'Error creating checkout session' });
  }
};

router.post('/', createCheckoutSession);

export default router; 