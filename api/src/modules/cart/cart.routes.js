const router = require('express').Router();
const { requireAuth } = require('../../shared/auth.middleware');
const Cart = require('./cart.model');
const Product = require('../products/product.model');

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

      return {
        ...cartItem,
        stock: productDocument ? getAvailableProductStock(productDocument) : 0,
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
      (item) => String(item.productId) !== String(productId),
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
