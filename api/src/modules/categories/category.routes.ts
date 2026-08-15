import { Router } from 'express';

import { createCategoryResponse } from './category.dto.js';
import Category from './category.model.js';

const router = Router();

router.get('/', async (request, response, nextMiddleware) => {
  try {
    const items = await Category.find().sort({ name: 1 });

    response.json(
      items.map((categoryDocument) => createCategoryResponse(categoryDocument)),
    );
  } catch (error: unknown) {
    nextMiddleware(error);
  }
});

export default router;
