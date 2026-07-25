const router = require('express').Router();
const { isValidObjectId } = require('mongoose');
const {
  createProductSearchFilter,
} = require('../../shared/create-product-search-filter');
const Category = require('../categories/category.model');
const Product = require('./product.model');

const MAX_PRODUCTS_AVAILABILITY_REQUEST_SIZE = 100;

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

    const filter = {
      ...createProductSearchFilter(search),
      stock: {
        $gt: 0,
      },
    };

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

router.post('/availability', async (request, response, next) => {
  try {
    const { productIds = [] } = request.body || {};

    if (!Array.isArray(productIds)) {
      return response.status(400).json({
        message: 'productIds must be an array',
      });
    }

    const normalizedProductIds = Array.from(
      new Set(
        productIds.map((productId) => String(productId).trim()).filter(Boolean),
      ),
    );

    if (normalizedProductIds.length > MAX_PRODUCTS_AVAILABILITY_REQUEST_SIZE) {
      return response.status(400).json({
        message: `A maximum of ${MAX_PRODUCTS_AVAILABILITY_REQUEST_SIZE} products can be checked`,
      });
    }

    const validProductIds = normalizedProductIds.filter((productId) =>
      isValidObjectId(productId),
    );

    const productDocuments = await Product.find({
      _id: {
        $in: validProductIds,
      },
    })
      .select('_id stock')
      .lean();

    const productStockById = new Map(
      productDocuments.map((productDocument) => [
        String(productDocument._id),
        Math.max(0, Math.floor(Number(productDocument.stock) || 0)),
      ]),
    );

    return response.json({
      items: normalizedProductIds.map((productId) => ({
        productId,
        stock: productStockById.get(productId) ?? 0,
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      stock: {
        $gt: 0,
      },
    });

    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
