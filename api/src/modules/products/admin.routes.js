const router = require('express').Router();
const { requireAuth, requireRole } = require('../../shared/auth.middleware');
const Product = require('./product.model');
const Category = require('../categories/category.model');

router.use(requireAuth, requireRole('admin'));

// GET /api/admin/products?search=&page=1&limit=20
router.get('/', async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const q = {};
    if (search) q.$text = { $search: search };

    const pg = Math.max(1, parseInt(page, 10) || 1);
    const lm = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const [items, total] = await Promise.all([
      Product.find(q)
        .sort({ createdAt: -1 })
        .skip((pg - 1) * lm)
        .limit(lm)
        .lean(),
      Product.countDocuments(q),
    ]);

    // подтянем названия категорий для удобства таблицы
    const catIds = [
      ...new Set(items.map((i) => String(i.categoryId)).filter(Boolean)),
    ];
    const cats = await Category.find({ _id: { $in: catIds } }).lean();
    const cmap = new Map(cats.map((c) => [String(c._id), c.name]));
    const withCat = items.map((i) => ({
      ...i,
      categoryName: cmap.get(String(i.categoryId)) || '',
    }));

    res.json({ items: withCat, total, page: pg, pages: Math.ceil(total / lm) });
  } catch (e) {
    next(e);
  }
});

// POST /api/admin/products
router.post('/', async (req, res, next) => {
  try {
    const {
      title,
      slug,
      description,
      price,
      images = [],
      categoryId,
      stock = 0,
    } = req.body || {};
    if (!title || !slug || !price)
      return res.status(400).json({ message: 'title, slug, price required' });
    const exists = await Product.findOne({ slug });
    if (exists) return res.status(409).json({ message: 'Slug already exists' });
    const created = await Product.create({
      title,
      slug,
      description,
      price,
      images,
      categoryId,
      stock,
    });
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

// PATCH /api/admin/products/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const patch = req.body || {};
    if (patch.slug) {
      const dup = await Product.findOne({
        _id: { $ne: req.params.id },
        slug: patch.slug,
      });
      if (dup) return res.status(409).json({ message: 'Slug already exists' });
    }
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: patch },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

// DELETE /api/admin/products/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const del = await Product.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ message: 'Product not found' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
