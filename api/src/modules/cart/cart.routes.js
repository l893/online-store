const router = require('express').Router();
const { requireAuth } = require('../../shared/auth.middleware');
const Cart = require('./cart.model');
const Product = require('../products/product.model');
const { deleteUserCartDocument } = require('./cart.service');

function getAvailableProductStock(productDocument) {
  return Math.max(0, Math.floor(Number(productDocument.stock) || 0));
}

async function getProductDocumentsById(cartItems) {
  const productIds = cartItems
    .map((cartItem) => cartItem.productId)
    .filter(Boolean);

  const productDocuments = await Product.find({
    _id: {
      $in: productIds,
    },
  })
    .select('title price images stock')
    .lean();

  return new Map(
    productDocuments.map((productDocument) => [
      String(productDocument._id),
      productDocument,
    ]),
  );
}

function createCartResponse(cartDocument, productDocumentsById) {
  return {
    ...cartDocument,
    items: (cartDocument.items || []).map((cartItem) => {
      const productDocument = productDocumentsById.get(
        String(cartItem.productId),
      );

      const currentProductDetails = productDocument
        ? {
            title: productDocument.title,
            price: productDocument.price,
            image: productDocument.images?.[0] || '',
            stock: getAvailableProductStock(productDocument),
          }
        : {
            stock: 0,
          };

      return {
        ...cartItem,
        ...currentProductDetails,
      };
    }),
  };
}

function getCartItemQuantitiesByProductId(cartDocument) {
  return new Map(
    (cartDocument?.items || []).map((cartItem) => [
      String(cartItem.productId),
      Math.max(1, Number(cartItem.qty) || 1),
    ]),
  );
}

router.use(requireAuth);

// GET /api/cart
router.get('/', async (request, response, next) => {
  try {
    const cartDocument = await Cart.findOne({
      userId: request.user.id,
    }).lean();

    if (!cartDocument) {
      return response.json({
        userId: request.user.id,
        items: [],
      });
    }

    const productDocumentsById = await getProductDocumentsById(
      cartDocument.items,
    );

    return response.json(
      createCartResponse(cartDocument, productDocumentsById),
    );
  } catch (error) {
    next(error);
  }
});

// PUT /api/cart  { items:[{productId, qty}] }
router.put('/', async (request, response, next) => {
  try {
    const { items = [] } = request.body || {};

    const existingCartDocument = await Cart.findOne({
      userId: request.user.id,
    }).lean();
    const existingCartItemQuantitiesByProductId =
      getCartItemQuantitiesByProductId(existingCartDocument);

    // нормализация: подтянем актуальные title/price с продуктов
    const productDocumentsById = await getProductDocumentsById(items);

    const normalizedCartItems = [];

    for (const requestedCartItem of items) {
      const productDocument = productDocumentsById.get(
        String(requestedCartItem.productId),
      );

      if (!productDocument) {
        continue;
      }

      const parsedRequestedQuantity = Number.parseInt(
        requestedCartItem.qty,
        10,
      );
      const requestedQuantity = Number.isInteger(parsedRequestedQuantity)
        ? Math.max(1, parsedRequestedQuantity)
        : 1;
      const availableStock = getAvailableProductStock(productDocument);
      const existingQuantity =
        existingCartItemQuantitiesByProductId.get(
          String(productDocument._id),
        ) || 0;
      const maximumAllowedQuantity = Math.max(availableStock, existingQuantity);

      if (requestedQuantity > maximumAllowedQuantity) {
        return response.status(409).json({
          code: 'INSUFFICIENT_STOCK',
          message: `Недостаточно товара «${productDocument.title}» на складе`,
          productId: String(productDocument._id),
          requestedQuantity,
          availableStock,
          existingQuantity,
        });
      }

      normalizedCartItems.push({
        productId: productDocument._id,
        title: productDocument.title,
        price: productDocument.price,
        image: productDocument.images?.[0] || '',
        qty: requestedQuantity,
      });
    }

    if (normalizedCartItems.length === 0) {
      await deleteUserCartDocument(request.user.id);

      return response.json({
        userId: request.user.id,
        items: [],
      });
    }

    const cartDocument = await Cart.findOneAndUpdate(
      {
        userId: request.user.id,
      },
      {
        $set: {
          items: normalizedCartItems,
          updatedAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
      },
    ).lean();

    return response.json(
      createCartResponse(cartDocument, productDocumentsById),
    );
  } catch (error) {
    next(error);
  }
});

// Удаление товара из корзины
router.delete('/item/:productId', async (request, response, next) => {
  try {
    const { productId } = request.params;

    // Найдём корзину пользователя
    const cartDocument = await Cart.findOne({
      userId: request.user.id,
    });

    if (!cartDocument) {
      return response.json({
        userId: request.user.id,
        items: [],
      });
    }

    // Удаляем товар из массива
    cartDocument.items = cartDocument.items.filter(
      (cartItem) => String(cartItem.productId) !== String(productId),
    );

    if (cartDocument.items.length === 0) {
      await deleteUserCartDocument(request.user.id);

      return response.json({
        userId: request.user.id,
        items: [],
      });
    }

    cartDocument.markModified('items');
    cartDocument.updatedAt = new Date();

    // Обновляем корзину в базе
    await cartDocument.save();

    const updatedCartDocument = cartDocument.toObject();
    const productDocumentsById = await getProductDocumentsById(
      updatedCartDocument.items,
    );

    return response.json(
      createCartResponse(updatedCartDocument, productDocumentsById),
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;
