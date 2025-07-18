import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, itemIds } = req.body;
  const catalog = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'catalog.json'), 'utf8'));

  const line_items = itemIds.map(id => {
    const p = catalog.find(prod => prod.id === id);
    return {
      price_data: {
        currency: 'eur',
        product_data: { name: p.name },
        unit_amount: Math.round(p.price * 100),
      },
      quantity: 1
    };
  });

  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: 'payment',
    customer_email: email,
    success_url: `${process.env.VERCEL_URL}/success.html?email=${encodeURIComponent(email)}&items=${itemIds.join(',')}`,
    cancel_url: `${process.env.VERCEL_URL}/cart.html`,
  });

  res.json({ url: session.url });
}
