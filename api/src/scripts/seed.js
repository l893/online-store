require('dotenv').config();

if (process.env.NODE_ENV === 'production') {
  throw new Error('Database seed is disabled in production');
}

const mongoose = require('mongoose');
const Category = require('../modules/categories/category.model');
const Product = require('../modules/products/product.model');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shop';

function toSlug(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9а-яё\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function run() {
  await mongoose.connect(MONGODB_URI);

  await Category.deleteMany({});
  await Product.deleteMany({});

  const cats = await Category.insertMany([
    { name: 'Периферия', slug: 'periferiya' },
    { name: 'Бытовая техника', slug: 'bytovaya-tehnika' },
    { name: 'Комплектующие', slug: 'komplektuyushchie' },
  ]);

  const sample = [
    { title: 'Монитор 24"', price: 12000, category: 'Периферия' },
    { title: 'Мышь игровая', price: 1500, category: 'Периферия' },
    { title: 'Клавиатура механическая', price: 4500, category: 'Периферия' },
    { title: 'Холодильник 300л', price: 33000, category: 'Бытовая техника' },
    { title: 'Пылесос', price: 8000, category: 'Бытовая техника' },
    { title: 'SSD 1 ТБ', price: 9000, category: 'Комплектующие' },
    { title: 'Видеокарта', price: 120000, category: 'Комплектующие' },
  ];

  const products = [];
  for (let i = 0; i < 25; i++) {
    const base = sample[i % sample.length];
    const cat = cats.find((c) => c.name === base.category);
    const title = `${base.title} ${i + 1}`;
    products.push({
      title,
      slug: `${toSlug(title)}-${i + 1}`,
      description: 'Краткое описание товара для тестового магазина.',
      price: base.price + (i % 5) * 300,
      images: [],
      categoryId: cat._id,
      stock: 10 + (i % 7),
    });
  }

  await Product.insertMany(products);
  console.log('Seed done:', {
    categories: cats.length,
    products: products.length,
  });

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
