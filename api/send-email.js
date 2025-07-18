import { Resend } from 'resend';
import catalog from '../data/catalog.json' assert { type: 'json' };

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método no permitido');
  }

  const { email, itemIds } = req.body;

  if (!email || !itemIds || !Array.isArray(itemIds)) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const links = itemIds
    .map(id => catalog.find(p => p.id === id)?.link_drive)
    .filter(Boolean)
    .join('\n');

  try {
    await resend.emails.send({
      from: 'Tienda Educa <noreply@tu-dominio.com>',
      to: email,
      subject: 'Tus recursos educativos',
      text: `¡Gracias por tu compra!\n\nAquí están los enlaces a tus recursos:\n\n${links}`
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
