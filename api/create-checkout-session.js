const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Server-side price map — prevents client-side price tampering
const MENU_PRICES = {
  'Œuf nuage à la truffe': 1400,
  'Rose de betterave et fromage de chèvre frais': 1200,
  'Velouté crémeux aux châtaignes': 1100,
  'Coquilles Saint-Jacques à la parisienne': 1800,
  'Poulet en pâte à brique et estragon': 2400,
  'Filet mignon sauce aux baies roses': 3200,
  "Jarret d'agneau provençal": 2800,
  'Saumon en papillote royale': 2600,
  'Dôme de chocolat noir': 1200,
  "Poire pochée à l'hibiscus": 1000,
  'Soufflé du jour': 1300,
};

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Build line items using server-enforced prices
    const line_items = items.map(item => {
      const serverPrice = MENU_PRICES[item.name];
      if (!serverPrice) {
        throw new Error(`Unknown menu item: ${item.name}`);
      }
      const qty = Math.max(1, Math.min(99, parseInt(item.qty) || 1));

      return {
        price_data: {
          currency: 'eur',
          product_data: { name: item.name },
          unit_amount: serverPrice,
        },
        quantity: qty,
      };
    });

    const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'https://your-site.vercel.app';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${origin}?checkout=success`,
      cancel_url: `${origin}?checkout=cancel`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
