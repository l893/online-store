const router = require('express').Router();
const { requireAuth, requireRole } = require('../../shared/auth.middleware');
const {
  createProductSearchFilter,
  isProductSearchQueryTooLong,
} = require('../../shared/create-product-search-filter');
const {
  isMongoDuplicateKeyError,
} = require('../../shared/is-mongo-duplicate-key-error');
const {
  getProductFieldsExceedingLengthLimits,
} = require('./product-input-limits');
const Product = require('./product.model');
const Category = require('../categories/category.model');

const PRODUCT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ALLOWED_PRODUCT_PATCH_FIELDS = new Set([
  'title',
  'slug',
  'description',
  'price',
  'images',
  'categoryId',
  'stock',
]);

function isValidProductSlug(productSlug) {
  return (
    typeof productSlug === 'string' && PRODUCT_SLUG_PATTERN.test(productSlug)
  );
}

function sendInvalidProductSlugResponse(response) {
  return response.status(400).json({
    code: 'PRODUCT_SLUG_INVALID',
    message: 'Invalid product slug',
  });
}

function sendProductSlugConflictResponse(response) {
  return response.status(409).json({
    code: 'PRODUCT_SLUG_CONFLICT',
    message: 'Slug already exists',
  });
}

function sendInvalidProductPatchFieldsResponse(
  response,
  unsupportedFieldNames,
) {
  return response.status(400).json({
    code: 'PRODUCT_PATCH_FIELDS_INVALID',
    message: 'Unsupported product fields',
    fields: unsupportedFieldNames,
  });
}

function sendProductInputTooLongResponse(response, fieldNames) {
  return response.status(400).json({
    code: 'PRODUCT_INPUT_TOO_LONG',
    message: 'Product input exceeds allowed length',
    fields: fieldNames,
  });
}

router.use(requireAuth, requireRole('admin'));

// GET /api/admin/products?search=&page=1&limit=20
router.get('/', async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;

    if (isProductSearchQueryTooLong(search)) {
      return res.status(400).json({
        code: 'PRODUCT_SEARCH_QUERY_TOO_LONG',
        message: 'Search query exceeds allowed length',
      });
    }

    const filter = createProductSearchFilter(search, {
      includeExactIdentifierMatches: true,
    });

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

    const fieldsExceedingLengthLimits = getProductFieldsExceedingLengthLimits({
      title,
      slug,
      description,
      images,
    });

    if (fieldsExceedingLengthLimits.length > 0) {
      return sendProductInputTooLongResponse(res, fieldsExceedingLengthLimits);
    }

    if (!isValidProductSlug(slug)) {
      return sendInvalidProductSlugResponse(res);
    }

    const exists = await Product.findOne({ slug });
    if (exists) {
      return sendProductSlugConflictResponse(res);
    }

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
    if (isMongoDuplicateKeyError(error, 'slug')) {
      return sendProductSlugConflictResponse(res);
    }

    next(error);
  }
});

// PATCH /api/admin/products/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const requestBody = req.body;

    if (
      !requestBody ||
      typeof requestBody !== 'object' ||
      Array.isArray(requestBody)
    ) {
      return res.status(400).json({
        code: 'PRODUCT_PATCH_INVALID',
        message: 'Product patch must be an object',
      });
    }

    const patchFieldNames = Object.keys(requestBody);
    const unsupportedFieldNames = patchFieldNames.filter(
      (fieldName) => !ALLOWED_PRODUCT_PATCH_FIELDS.has(fieldName),
    );

    if (unsupportedFieldNames.length > 0) {
      return sendInvalidProductPatchFieldsResponse(res, unsupportedFieldNames);
    }

    if (patchFieldNames.length === 0) {
      return res.status(400).json({
        code: 'PRODUCT_PATCH_EMPTY',
        message: 'Product patch is empty',
      });
    }

    const fieldsExceedingLengthLimits =
      getProductFieldsExceedingLengthLimits(requestBody);

    if (fieldsExceedingLengthLimits.length > 0) {
      return sendProductInputTooLongResponse(res, fieldsExceedingLengthLimits);
    }

    const patch = { ...requestBody };
    const hasSlug = Object.prototype.hasOwnProperty.call(patch, 'slug');
    const hasCategoryId = Object.prototype.hasOwnProperty.call(
      patch,
      'categoryId',
    );
    const shouldUnsetCategoryId = hasCategoryId && !patch.categoryId;

    if (shouldUnsetCategoryId) {
      delete patch.categoryId;
    }

    if (hasSlug && !isValidProductSlug(patch.slug)) {
      return sendInvalidProductSlugResponse(res);
    }

    if (hasSlug) {
      const duplicateProduct = await Product.findOne({
        _id: { $ne: req.params.id },
        slug: patch.slug,
      });

      if (duplicateProduct) {
        return sendProductSlugConflictResponse(res);
      }
    }
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      shouldUnsetCategoryId
        ? { $set: patch, $unset: { categoryId: 1 } }
        : { $set: patch },
      {
        new: true,
        runValidators: true,
      },
    );
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (error) {
    if (isMongoDuplicateKeyError(error, 'slug')) {
      return sendProductSlugConflictResponse(res);
    }

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
