const router = require('express').Router();
const { requireAuth } = require('../../shared/auth.middleware');
const Cart = require('../cart/cart.model');
const Order = require('./order.model');

router.use(requireAuth);

// POST /api/orders   { items? }
router.post('/', async (req, res, next) => {
  try {
    let items = req.body?.items;

    if (!items) {
      // создаём заказ из серверной корзины
      const cart = await Cart.findOne({ userId: req.user.id });

      items = (cart?.items || []).map((i) => ({
        productId: i.productId,
        titleSnapshot: i.title,
        priceSnapshot: i.price,
        qty: i.qty,
        image: i.image,
      }));
    }

    if (!items || !items.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const total = items.reduce((s, i) => s + i.priceSnapshot * i.qty, 0);
    const order = await Order.create({
      userId: req.user.id,
      items,
      total,
      status: 'draft',
    });

    res.json({ orderId: order._id, total });
  } catch (e) {
    next(e);
  }
});

// POST /api/checkout/confirm  { orderId }
router.post('/checkout/confirm', async (req, res, next) => {
  try {
    const { orderId } = req.body || {};

    if (!orderId) return res.status(400).json({ message: 'orderId required' });

    const order = await Order.findOne({ _id: orderId, userId: req.user.id });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status === 'paid')
      return res.json({ ok: true, status: order.status });

    order.status = 'paid';
    await order.save();

    // очистим серверную корзину
    await Cart.updateOne(
      { userId: req.user.id },
      { $set: { items: [], updatedAt: new Date() } }
    );

    res.json({ ok: true, status: 'paid' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
