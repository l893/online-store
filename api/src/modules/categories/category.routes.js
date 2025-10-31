const router = require('express').Router();
const Category = require('./category.model');

router.get('/', async (req, res, next) => {
  try {
    const items = await Category.find().sort({ name: 1 });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
