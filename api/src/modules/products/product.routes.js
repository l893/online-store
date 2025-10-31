const router = require('express').Router();
const Product = require('./product.model');

router.get('/', async (req, res, next) => {
  try {
    const {
      search = '',
      category,
      sort = 'price_asc',
      page = 1,
      limit = 12,
    } = req.query;
    const q = {};
    if (search) q.$text = { $search: search };
    if (category) q.categoryId = category;

    const sortMap = { price_asc: { price: 1 }, price_desc: { price: -1 } };
    const s = sortMap[sort] || {};

    const pg = Math.max(1, parseInt(page, 10) || 1);
    const lm = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));

    const [items, total] = await Promise.all([
      Product.find(q)
        .sort(s)
        .skip((pg - 1) * lm)
        .limit(lm),
      Product.countDocuments(q),
    ]);

    res.json({ items, total, page: pg, pages: Math.ceil(total / lm) });
  } catch (e) {
    next(e);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const item = await Product.findOne({ slug: req.params.slug });
    if (!item) return res.status(404).json({ message: 'Product not found' });
    res.json(item);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
