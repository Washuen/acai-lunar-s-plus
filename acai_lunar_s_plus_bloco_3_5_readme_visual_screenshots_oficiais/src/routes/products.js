const express = require('express');
const { prisma } = require('../lib/prisma');
const { asyncHandler } = require('../utils/asyncHandler');
const { optionalAuth, requireAuth, requireAdmin } = require('../middleware/auth');
const { cleanText, isValidMoney, isValidStock, boolValue } = require('../utils/validators');

const router = express.Router();

function serializeProduct(product) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    desc: product.description,
    price: Number(product.price),
    image: product.image,
    tag: product.tag,
    stock: product.stock,
    active: product.active,
    featured: product.featured,
    category: product.category?.name || product.category,
    categoryId: product.categoryId
  };
}

function sanitizeSlug(value) {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
}

async function assertCategoryExists(categoryId) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  return category;
}

router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const isAdmin = req.user && ['OWNER', 'ADMIN'].includes(req.user.role);
  const includeInactive = req.query.includeInactive === 'true' && isAdmin;
  const products = await prisma.product.findMany({
    where: includeInactive ? {} : { active: true },
    include: { category: true },
    orderBy: [{ featured: 'desc' }, { createdAt: 'asc' }]
  });
  res.json({ products: products.map(serializeProduct) });
}));

router.get('/categories', optionalAuth, asyncHandler(async (req, res) => {
  const isAdmin = req.user && ['OWNER', 'ADMIN'].includes(req.user.role);
  const includeInactive = req.query.includeInactive === 'true' && isAdmin;
  const categories = await prisma.category.findMany({
    where: includeInactive ? {} : { active: true },
    orderBy: { position: 'asc' }
  });
  res.json({ categories });
}));

router.post('/', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const name = cleanText(req.body.name);
  const slug = sanitizeSlug(req.body.slug || name);
  const description = cleanText(req.body.description);
  const image = cleanText(req.body.image);
  const tag = cleanText(req.body.tag) || null;
  const categoryId = cleanText(req.body.categoryId);
  const price = Number(req.body.price);
  const stock = Number(req.body.stock ?? 0);

  if (name.length < 2 || description.length < 8 || !image || !categoryId) {
    return res.status(400).json({ message: 'Nome, descrição, imagem e categoria são obrigatórios.' });
  }
  if (!slug) return res.status(400).json({ message: 'Slug inválido.' });
  if (!isValidMoney(price, { min: 0.01, max: 9999 })) return res.status(400).json({ message: 'Preço inválido.' });
  if (!isValidStock(stock)) return res.status(400).json({ message: 'Estoque inválido.' });

  const category = await assertCategoryExists(categoryId);
  if (!category) return res.status(400).json({ message: 'Categoria inválida.' });

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      price,
      image,
      tag,
      stock,
      active: boolValue(req.body.active, true),
      featured: boolValue(req.body.featured, false),
      categoryId
    },
    include: { category: true }
  });
  await prisma.auditLog.create({ data: { action: 'PRODUCT_CREATED', entity: 'Product', entityId: product.id, userId: req.user.id, metadata: { name: product.name } } });
  res.status(201).json({ product: serializeProduct(product) });
}));

router.patch('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const data = {};
  if (req.body.name !== undefined) {
    data.name = cleanText(req.body.name);
    if (data.name.length < 2) return res.status(400).json({ message: 'Nome inválido.' });
  }
  if (req.body.slug !== undefined) {
    data.slug = sanitizeSlug(req.body.slug);
    if (!data.slug) return res.status(400).json({ message: 'Slug inválido.' });
  }
  if (req.body.description !== undefined) {
    data.description = cleanText(req.body.description);
    if (data.description.length < 8) return res.status(400).json({ message: 'Descrição muito curta.' });
  }
  if (req.body.image !== undefined) {
    data.image = cleanText(req.body.image);
    if (!data.image) return res.status(400).json({ message: 'Imagem inválida.' });
  }
  if (req.body.tag !== undefined) data.tag = cleanText(req.body.tag) || null;
  if (req.body.price !== undefined) {
    data.price = Number(req.body.price);
    if (!isValidMoney(data.price, { min: 0.01, max: 9999 })) return res.status(400).json({ message: 'Preço inválido.' });
  }
  if (req.body.stock !== undefined) {
    data.stock = Number(req.body.stock);
    if (!isValidStock(data.stock)) return res.status(400).json({ message: 'Estoque inválido.' });
  }
  if (req.body.active !== undefined) data.active = boolValue(req.body.active);
  if (req.body.featured !== undefined) data.featured = boolValue(req.body.featured);
  if (req.body.categoryId !== undefined) {
    data.categoryId = cleanText(req.body.categoryId);
    const category = await assertCategoryExists(data.categoryId);
    if (!category) return res.status(400).json({ message: 'Categoria inválida.' });
  }

  const product = await prisma.product.update({ where: { id: req.params.id }, data, include: { category: true } });
  await prisma.auditLog.create({ data: { action: 'PRODUCT_UPDATED', entity: 'Product', entityId: product.id, userId: req.user.id, metadata: { name: product.name, fields: Object.keys(req.body) } } });
  res.json({ product: serializeProduct(product) });
}));

router.patch('/:id/stock', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const stock = Number(req.body.stock);
  if (!isValidStock(stock)) return res.status(400).json({ message: 'Estoque inválido.' });
  const product = await prisma.product.update({ where: { id: req.params.id }, data: { stock }, include: { category: true } });
  await prisma.auditLog.create({ data: { action: 'STOCK_UPDATED', entity: 'Product', entityId: product.id, userId: req.user.id, metadata: { name: product.name, stock } } });
  res.json({ product: serializeProduct(product) });
}));

module.exports = router;
