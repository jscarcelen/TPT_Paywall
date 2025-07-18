import Stripe from 'stripe';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, itemIds } = req.body;

  // ✅ Leer catálogo
  const catalogRaw = await fs.readFile(path.join(__dirname, '../data/catalog.json'), 'utf-8');
  const catalog = JSON.parse(catalogRaw);

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

  res.status(200).json({ url: session.url });
}
