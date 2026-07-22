const router = require('express').Router();
const { isValidObjectId } = require('mongoose');
const {
  createProductSearchFilter,
} = require('../../shared/create-product-search-filter');
const Category = require('../categories/category.model');
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

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));

    const filter = createProductSearchFilter(search);

    if (category) {
      const categoryDocument = await Category.findOne({
        slug: category,
      })
        .select('_id')
        .lean();

      if (categoryDocument) {
        filter.categoryId = categoryDocument._id;
      } else if (isValidObjectId(category)) {
        filter.categoryId = category;
      } else {
        return res.json({
          items: [],
          total: 0,
          page: currentPage,
          pages: 0,
        });
      }
    }

    const sortMap = {
      price_asc: {
        price: 1,
      },
      price_desc: {
        price: -1,
      },
    };

    const sortOption = sortMap[sort] || {};

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip((currentPage - 1) * pageLimit)
        .limit(pageLimit),
      Product.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page: currentPage,
      pages: Math.ceil(total / pageLimit),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
