import { Router } from 'express';
import type { Response } from 'express';

import { requireAuth, requireRole } from '../../shared/auth.middleware.js';
import {
  createProductSearchFilter,
  isProductSearchQueryTooLong,
} from '../../shared/create-product-search-filter.js';
import { isMongoDuplicateKeyError } from '../../shared/is-mongo-duplicate-key-error.js';
import Category from '../categories/category.model.js';
import {
  createAdminProductResponse,
  createProductResponse,
} from './product.dto.js';
import { getProductFieldsExceedingLengthLimits } from './product-input-limits.js';
import Product from './product.model.js';

const PRODUCT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ALLOWED_PRODUCT_PATCH_FIELDS = new Set<string>([
  'title',
  'slug',
  'description',
  'price',
  'images',
  'categoryId',
  'stock',
]);

const router = Router();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getRequestBody(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function getIntegerQueryValue(value: unknown, fallbackValue: number): number {
  const parsedValue = Number.parseInt(String(value ?? ''), 10);

  return Number.isInteger(parsedValue) ? parsedValue : fallbackValue;
}

function isValidProductSlug(productSlug: unknown): productSlug is string {
  return (
    typeof productSlug === 'string' && PRODUCT_SLUG_PATTERN.test(productSlug)
  );
}

function sendInvalidProductSlugResponse(response: Response): Response {
  return response.status(400).json({
    code: 'PRODUCT_SLUG_INVALID',
    message: 'Invalid product slug',
  });
}

function sendProductSlugConflictResponse(response: Response): Response {
  return response.status(409).json({
    code: 'PRODUCT_SLUG_CONFLICT',
    message: 'Slug already exists',
  });
}

function sendInvalidProductPatchFieldsResponse(
  response: Response,
  unsupportedFieldNames: readonly string[],
): Response {
  return response.status(400).json({
    code: 'PRODUCT_PATCH_FIELDS_INVALID',
    message: 'Unsupported product fields',
    fields: unsupportedFieldNames,
  });
}

function sendProductInputTooLongResponse(
  response: Response,
  fieldNames: readonly string[],
): Response {
  return response.status(400).json({
    code: 'PRODUCT_INPUT_TOO_LONG',
    message: 'Product input exceeds allowed length',
    fields: fieldNames,
  });
}

router.use(requireAuth, requireRole('admin'));

// GET /api/admin/products?search=&page=1&limit=20
router.get('/', async (request, response, nextMiddleware) => {
  try {
    const search = request.query.search ?? '';

    if (isProductSearchQueryTooLong(search)) {
      return response.status(400).json({
        code: 'PRODUCT_SEARCH_QUERY_TOO_LONG',
        message: 'Search query exceeds allowed length',
      });
    }

    const filter = createProductSearchFilter(search, {
      includeExactIdentifierMatches: true,
    });

    const currentPage = Math.max(
      1,
      getIntegerQueryValue(request.query.page, 1),
    );
    const pageLimit = Math.min(
      100,
      Math.max(1, getIntegerQueryValue(request.query.limit, 20)),
    );

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
    const productsWithCategoryName = items.map((product) =>
      createAdminProductResponse(
        product,
        product.categoryId
          ? categoryNameById.get(String(product.categoryId)) || ''
          : '',
      ),
    );

    response.json({
      items: productsWithCategoryName,
      total,
      page: currentPage,
      pages: Math.ceil(total / pageLimit),
    });
  } catch (error: unknown) {
    nextMiddleware(error);
  }
});

// POST /api/admin/products
router.post('/', async (request, response, nextMiddleware) => {
  try {
    const requestBody = getRequestBody(request.body);
    const { title, slug, description, price, categoryId } = requestBody;
    const images = requestBody.images ?? [];
    const stock = requestBody.stock ?? 0;

    if (!title || !slug || !price) {
      return response
        .status(400)
        .json({ message: 'title, slug, price required' });
    }

    const fieldsExceedingLengthLimits = getProductFieldsExceedingLengthLimits({
      title,
      slug,
      description,
      images,
    });

    if (fieldsExceedingLengthLimits.length > 0) {
      return sendProductInputTooLongResponse(
        response,
        fieldsExceedingLengthLimits,
      );
    }

    if (!isValidProductSlug(slug)) {
      return sendInvalidProductSlugResponse(response);
    }

    const exists = await Product.findOne({ slug });
    if (exists) {
      return sendProductSlugConflictResponse(response);
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
    response.status(201).json(createProductResponse(created));
  } catch (error: unknown) {
    if (isMongoDuplicateKeyError(error, 'slug')) {
      return sendProductSlugConflictResponse(response);
    }

    nextMiddleware(error);
  }
});

// PATCH /api/admin/products/:id
router.patch('/:id', async (request, response, nextMiddleware) => {
  try {
    const requestBody = request.body;

    if (!isRecord(requestBody)) {
      return response.status(400).json({
        code: 'PRODUCT_PATCH_INVALID',
        message: 'Product patch must be an object',
      });
    }

    const patchFieldNames = Object.keys(requestBody);
    const unsupportedFieldNames = patchFieldNames.filter(
      (fieldName) => !ALLOWED_PRODUCT_PATCH_FIELDS.has(fieldName),
    );

    if (unsupportedFieldNames.length > 0) {
      return sendInvalidProductPatchFieldsResponse(
        response,
        unsupportedFieldNames,
      );
    }

    if (patchFieldNames.length === 0) {
      return response.status(400).json({
        code: 'PRODUCT_PATCH_EMPTY',
        message: 'Product patch is empty',
      });
    }

    const fieldsExceedingLengthLimits =
      getProductFieldsExceedingLengthLimits(requestBody);

    if (fieldsExceedingLengthLimits.length > 0) {
      return sendProductInputTooLongResponse(
        response,
        fieldsExceedingLengthLimits,
      );
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

    if (hasSlug) {
      const productSlug = patch.slug;

      if (!isValidProductSlug(productSlug)) {
        return sendInvalidProductSlugResponse(response);
      }

      const duplicateProduct = await Product.findOne({
        _id: { $ne: request.params.id },
        slug: productSlug,
      });

      if (duplicateProduct) {
        return sendProductSlugConflictResponse(response);
      }
    }

    const updated = await Product.findByIdAndUpdate(
      request.params.id,
      shouldUnsetCategoryId
        ? { $set: patch, $unset: { categoryId: 1 } }
        : { $set: patch },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updated) {
      return response.status(404).json({
        message: 'Product not found',
      });
    }

    response.json(createProductResponse(updated));
  } catch (error: unknown) {
    if (isMongoDuplicateKeyError(error, 'slug')) {
      return sendProductSlugConflictResponse(response);
    }

    nextMiddleware(error);
  }
});

// DELETE /api/admin/products/:id
router.delete('/:id', async (request, response, nextMiddleware) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(request.params.id);

    if (!deletedProduct) {
      return response.status(404).json({
        message: 'Product not found',
      });
    }

    response.json({ ok: true });
  } catch (error: unknown) {
    nextMiddleware(error);
  }
});

export default router;
