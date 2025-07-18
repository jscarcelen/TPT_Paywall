import catalog from '../data/catalog.json' with { type: 'json' };

export default function handler(req, res) {
  const safeCatalog = catalog.map(({ link_drive, ...rest }) => rest);
  res.status(200).json(safeCatalog);
}
