import { Router } from 'express';

import Category from './category.model.js';

const router = Router();

router.get('/', async (request, response, nextMiddleware) => {
  try {
    const items = await Category.find().sort({ name: 1 });

    response.json(items);
  } catch (error: unknown) {
    nextMiddleware(error);
  }
});

export default router;
