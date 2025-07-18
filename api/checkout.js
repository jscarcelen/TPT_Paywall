import catalog from '../data/catalog.json' with { type: 'json' };
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Método no permitido');

  const { itemIds, email } = req.body;
  const items = catalog.filter(p => itemIds.includes(p.id));

  const lineItems = items.map(item => ({
    price_data: {
      currency: 'eur',
      product_data: { name: item.nombre },
      unit_amount: item.precio,
    },
    quantity: 1
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `https://${process.env.VERCEL_URL}/success.html?email=${email}&items=${itemIds.join(",")}`,
    cancel_url: `https://${process.env.VERCEL_URL}/`,
    metadata: { email }
  });

  res.status(200).json({ url: session.url });
}
