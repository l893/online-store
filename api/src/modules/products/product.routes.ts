import { Router } from 'express';
import { isValidObjectId } from 'mongoose';

import {
  createProductSearchFilter,
  isProductSearchQueryTooLong,
} from '../../shared/create-product-search-filter.js';
import Category from '../categories/category.model.js';
import { createProductResponse } from './product.dto.js';
import Product from './product.model.js';

const router = Router();

const MAX_PRODUCTS_AVAILABILITY_REQUEST_SIZE = 100;

type ProductSortValue = 'price_asc' | 'price_desc';

interface ProductListFilter extends Record<string, unknown> {
  categoryId?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getIntegerQueryValue(value: unknown, fallbackValue: number): number {
  const parsedValue = Number.parseInt(String(value ?? ''), 10);

  return Number.isInteger(parsedValue) ? parsedValue : fallbackValue;
}

function getProductSortValue(value: unknown): ProductSortValue {
  return value === 'price_desc' ? 'price_desc' : 'price_asc';
}

router.get('/', async (request, response, nextMiddleware) => {
  try {
    const search = request.query.search ?? '';
    const category =
      typeof request.query.category === 'string'
        ? request.query.category
        : undefined;
    const sort = getProductSortValue(request.query.sort);

    if (isProductSearchQueryTooLong(search)) {
      return response.status(400).json({
        code: 'PRODUCT_SEARCH_QUERY_TOO_LONG',
        message: 'Search query exceeds allowed length',
      });
    }

    const currentPage = Math.max(
      1,
      getIntegerQueryValue(request.query.page, 1),
    );
    const pageLimit = Math.min(
      100,
      Math.max(1, getIntegerQueryValue(request.query.limit, 12)),
    );

    const filter: ProductListFilter = {
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
        return response.json({
          items: [],
          total: 0,
          page: currentPage,
          pages: 0,
        });
      }
    }

    const sortMap: Record<
      ProductSortValue,
      {
        readonly price: 1 | -1;
        readonly _id: 1 | -1;
      }
    > = {
      price_asc: {
        price: 1,
        _id: 1,
      },
      price_desc: {
        price: -1,
        _id: -1,
      },
    };

    const sortOption = sortMap[sort];

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip((currentPage - 1) * pageLimit)
        .limit(pageLimit),
      Product.countDocuments(filter),
    ]);

    response.json({
      items: items.map((productDocument) =>
        createProductResponse(productDocument),
      ),
      total,
      page: currentPage,
      pages: Math.ceil(total / pageLimit),
    });
  } catch (error: unknown) {
    nextMiddleware(error);
  }
});

router.post('/availability', async (request, response, nextMiddleware) => {
  try {
    const requestBody = isRecord(request.body) ? request.body : {};
    const productIds = requestBody.productIds ?? [];

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
      .select('_id title price images stock')
      .lean();

    const productDocumentsById = new Map(
      productDocuments.map((productDocument) => [
        String(productDocument._id),
        productDocument,
      ]),
    );

    return response.json({
      items: normalizedProductIds.map((productId) => {
        const productDocument = productDocumentsById.get(productId);

        if (!productDocument) {
          return {
            productId,
            stock: 0,
          };
        }

        return {
          productId,
          title: productDocument.title,
          price: productDocument.price,
          image: productDocument.images?.[0] || '',
          stock: Math.max(0, Math.floor(Number(productDocument.stock) || 0)),
        };
      }),
    });
  } catch (error: unknown) {
    nextMiddleware(error);
  }
});

router.get('/:slug', async (request, response, nextMiddleware) => {
  try {
    const product = await Product.findOne({
      slug: request.params.slug,
      stock: {
        $gt: 0,
      },
    });

    if (!product) {
      return response.status(404).json({
        message: 'Product not found',
      });
    }

    response.json(createProductResponse(product));
  } catch (error: unknown) {
    nextMiddleware(error);
  }
});

export default router;
