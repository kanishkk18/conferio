// pages/api/payments/create-checkout-session-public.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@/lib/session';
import { isStripeConfigured, getStripe } from '@/lib/stripe';
import env from '@/lib/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!isStripeConfigured()) {
      return res.status(503).json({ error: { message: 'Stripe not configured' } });
    }

    const session = await getSession(req, res);
    if (!session?.user) {
      return res.status(401).json({ error: { message: 'Please sign in first' } });
    }

    const { price, quantity = 1 } = req.body;
    const stripe = getStripe();

    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email,
      mode: 'subscription',
      line_items: [{ price, quantity }],
      success_url: `${env.appUrl}/pricing?success=true`,
      cancel_url: `${env.appUrl}/pricing?canceled=true`,
    });

    res.json({ data: checkoutSession });
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
}