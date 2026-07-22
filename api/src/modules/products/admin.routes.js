const router = require('express').Router();
const { requireAuth, requireRole } = require('../../shared/auth.middleware');
const {
  createTitlePrefixFilter,
} = require('../../shared/create-title-prefix-filter');
const Product = require('./product.model');
const Category = require('../categories/category.model');

router.use(requireAuth, requireRole('admin'));

// GET /api/admin/products?search=&page=1&limit=20
router.get('/', async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    // const filter = {};
    // if (search) filter.$text = { $search: search };
    const filter = createTitlePrefixFilter(search);

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((currentPage - 1) * pageLimit)
        .limit(pageLimit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    // подтянем названия категорий для удобства таблицы
    const categoryIds = [
      ...new Set(
        items
          .map((product) => product.categoryId)
          .filter(Boolean)
          .map(String),
      ),
    ];
    const categories = categoryIds.length
      ? await Category.find({ _id: { $in: categoryIds } }).lean()
      : [];
    const categoryNameById = new Map(
      categories.map((category) => [String(category._id), category.name]),
    );
    const productsWithCategoryName = items.map((product) => ({
      ...product,
      categoryName: product.categoryId
        ? categoryNameById.get(String(product.categoryId)) || ''
        : '',
    }));

    res.json({
      items: productsWithCategoryName,
      total,
      page: currentPage,
      pages: Math.ceil(total / pageLimit),
    });
  } catch (error) {
    next(error);
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
      ...(categoryId ? { categoryId } : {}),
      stock,
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/products/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const patch = { ...(req.body || {}) };
    const hasCategoryId = Object.prototype.hasOwnProperty.call(
      patch,
      'categoryId',
    );
    const shouldUnsetCategoryId = hasCategoryId && !patch.categoryId;

    if (shouldUnsetCategoryId) {
      delete patch.categoryId;
    }

    if (patch.slug) {
      const duplicateProduct = await Product.findOne({
        _id: { $ne: req.params.id },
        slug: patch.slug,
      });
      if (duplicateProduct)
        return res.status(409).json({ message: 'Slug already exists' });
    }
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      shouldUnsetCategoryId
        ? { $set: patch, $unset: { categoryId: 1 } }
        : { $set: patch },
      { new: true },
    );
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/products/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct)
      return res.status(404).json({ message: 'Product not found' });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
