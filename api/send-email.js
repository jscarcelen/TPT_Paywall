import catalog from '../data/catalog.json' assert { type: 'json' };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Método no permitido');

  const { email, itemIds } = req.body;
  const links = itemIds
    .map(id => catalog.find(p => p.id === id)?.link_drive)
    .filter(Boolean)
    .join("\n");

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'origin': 'http://localhost'
    },
    body: JSON.stringify({
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_USER_ID,
      template_params: {
        to_email: email,
        mensaje: `Gracias por tu compra. Aquí tienes tus recursos:\n\n${links}`
      }
    })
  });

  if (response.ok) res.status(200).json({ ok: true });
  else res.status(500).json({ error: await response.text() });
}
