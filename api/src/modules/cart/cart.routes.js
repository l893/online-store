const router = require('express').Router();
const { requireAuth } = require('../../shared/auth.middleware');
const Cart = require('./cart.model');
const Product = require('../products/product.model');

router.use(requireAuth);

// GET /api/cart
router.get('/', async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    res.json(cart || { userId: req.user.id, items: [] });
  } catch (e) {
    next(e);
  }
});

// PUT /api/cart  { items:[{productId, qty}] }
router.put('/', async (req, res, next) => {
  try {
    const { items = [] } = req.body || {};
    // нормализация: подтянем актуальные title/price с продуктов
    const productIds = items.map((i) => i.productId).filter(Boolean);
    const products = await Product.find({ _id: { $in: productIds } });
    const map = new Map(products.map((p) => [String(p._id), p]));

    const normalized = [];
    for (const it of items) {
      const p = map.get(String(it.productId));

      if (!p) continue;

      const qty = Math.max(1, parseInt(it.qty || 1, 10));

      normalized.push({
        productId: p._id,
        title: p.title,
        price: p.price,
        image: p.images?.[0] || '',
        qty,
      });
    }

    const cart = await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { items: normalized, updatedAt: new Date() } },
      { upsert: true, new: true }
    );

    res.json(cart);
  } catch (e) {
    next(e);
  }
});

// Удаление товара из корзины
router.delete('/item/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Найдём корзину пользователя
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Корзина не найдена' });
    }

    // Удаляем товар из массива
    cart.items = cart.items.filter(
      (item) => String(item.productId) !== String(productId)
    );

    cart.markModified('items');
    cart.updatedAt = new Date();

    // Обновляем корзину в базе
    await cart.save();

    // Возвращаем обновлённую корзину
    res.json(cart);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
