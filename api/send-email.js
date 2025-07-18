import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, itemIds } = req.body;
  const catalog = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'catalog.json'), 'utf8'));

  const links = itemIds
    .map(id => catalog.find(p => p.id === id)?.link_drive)
    .filter(Boolean)
    .join('\n');

  try {
    await resend.emails.send({
      from: 'Tienda Educa <noreply@resend.dev>',
      to: email,
      subject: 'Tus recursos educativos',
      text: `Gracias por tu compra. Aquí están tus recursos:\n\n${links}`
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error al enviar email:", err);
    res.status(500).json({ error: err.message });
  }
}
