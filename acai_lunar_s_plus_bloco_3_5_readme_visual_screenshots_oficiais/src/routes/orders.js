const express = require('express');
const { prisma } = require('../lib/prisma');
const { asyncHandler } = require('../utils/asyncHandler');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const {
  cleanText,
  normalizeEmail,
  isValidEmail,
  isValidMoney,
  toMoney,
  normalizeCouponCode,
  isValidCouponCode,
  safeJson
} = require('../utils/validators');

const router = express.Router();

const statusMap = new Set(['RECEIVED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELED']);
const terminalStatus = new Set(['DELIVERED', 'CANCELED']);

function serializeOrder(order) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    address: order.address,
    notes: order.notes,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    discount: Number(order.discount),
    total: Number(order.total),
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    items: order.items?.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      image: item.image,
      custom: item.custom,
      metadata: item.metadata
    })) || []
  };
}

router.get('/', requireAuth, requireAdmin, asyncHandler(async (_req, res) => {
  const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } });
  res.json({ orders: orders.map(serializeOrder) });
}));

router.get('/mine', requireAuth, asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ orders: orders.map(serializeOrder) });
}));

router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const customerName = cleanText(req.body.customerName || req.user.name);
  const customerPhone = cleanText(req.body.customerPhone || req.user.phone) || null;
  const customerEmail = normalizeEmail(req.body.customerEmail || req.user.email);
  const address = cleanText(req.body.address || req.user.address);
  const notes = cleanText(req.body.notes) || null;
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const couponCode = normalizeCouponCode(req.body.couponCode);

  if (customerName.length < 2) return res.status(400).json({ message: 'Informe um nome válido para entrega.' });
  if (!isValidEmail(customerEmail)) return res.status(400).json({ message: 'Informe um e-mail válido.' });
  if (customerPhone && customerPhone.length < 8) return res.status(400).json({ message: 'Informe um telefone válido.' });
  if (address.length < 5) return res.status(400).json({ message: 'Informe um endereço válido.' });
  if (!items.length) return res.status(400).json({ message: 'Seu carrinho está vazio.' });
  if (items.length > 30) return res.status(400).json({ message: 'Pedido com muitos itens. Revise o carrinho.' });

  const productIds = [...new Set(items.filter(i => i.productId).map(i => cleanText(i.productId)))];
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map(p => [p.id, p]));

  let subtotal = 0;
  const normalizedItems = [];
  const stockUpdates = [];

  for (const item of items) {
    const productId = item.productId ? cleanText(item.productId) : null;
    const product = productId ? productMap.get(productId) : null;
    const quantity = Number(item.quantity || item.qty || 1);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return res.status(400).json({ message: 'Quantidade inválida no carrinho.' });
    }

    if (productId && !product) return res.status(400).json({ message: 'Produto não encontrado no carrinho.' });
    if (product && !product.active) return res.status(400).json({ message: `Produto indisponível: ${product.name}.` });
    if (product && product.stock < quantity) return res.status(400).json({ message: `Estoque insuficiente para ${product.name}.` });

    const isCustom = Boolean(item.custom || !product);
    const itemName = cleanText(product?.name || item.name || 'Item personalizado');
    const unitPrice = product ? Number(product.price) : Number(item.unitPrice || item.price || 0);
    if (itemName.length < 2 || !isValidMoney(unitPrice, { min: 0.01, max: 9999 })) {
      return res.status(400).json({ message: 'Item personalizado inválido no carrinho.' });
    }

    subtotal += unitPrice * quantity;
    normalizedItems.push({
      name: itemName.slice(0, 120),
      quantity,
      unitPrice,
      image: cleanText(product?.image || item.image) || null,
      custom: isCustom,
      metadata: safeJson(item.metadata, null),
      productId: product?.id || null
    });

    if (product) stockUpdates.push({ id: product.id, stock: product.stock - quantity });
  }

  subtotal = toMoney(subtotal);
  const setting = await prisma.storeSetting.findFirst();
  const deliveryFee = toMoney(setting?.deliveryFee || 6.9);
  const minimumOrder = Number(setting?.minimumOrder || 18);
  if (subtotal < minimumOrder) {
    return res.status(400).json({ message: `Pedido mínimo de R$ ${minimumOrder.toFixed(2).replace('.', ',')}.` });
  }
  if (setting && !setting.open) return res.status(400).json({ message: 'A loja está fechada no momento.' });

  let discount = 0;
  let coupon = null;
  if (couponCode) {
    if (!isValidCouponCode(couponCode)) return res.status(400).json({ message: 'Cupom inválido.' });
    coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    const now = new Date();
    const couponUsable = coupon
      && coupon.active
      && (!coupon.startsAt || coupon.startsAt <= now)
      && (!coupon.expiresAt || coupon.expiresAt >= now);
    if (!couponUsable) return res.status(400).json({ message: 'Cupom inválido ou indisponível.' });
    discount = toMoney(subtotal * (Number(coupon.percentage) / 100));
  }

  const total = toMoney(Math.max(0, subtotal + deliveryFee - discount));

  const order = await prisma.$transaction(async tx => {
    for (const update of stockUpdates) {
      await tx.product.update({ where: { id: update.id }, data: { stock: update.stock } });
    }

    const created = await tx.order.create({
      data: {
        customerName,
        customerPhone,
        customerEmail,
        address,
        notes,
        subtotal,
        deliveryFee,
        discount,
        total,
        userId: req.user.id,
        couponId: coupon?.id,
        items: { create: normalizedItems }
      },
      include: { items: true }
    });

    await tx.auditLog.create({
      data: {
        action: 'ORDER_CREATED',
        entity: 'Order',
        entityId: created.id,
        metadata: { orderNumber: created.orderNumber, total, coupon: coupon?.code || null },
        userId: req.user.id
      }
    });

    return created;
  });

  res.status(201).json({ order: serializeOrder(order) });
}));

router.patch('/:id/status', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!statusMap.has(status)) return res.status(400).json({ message: 'Status inválido.' });

  const current = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!current) return res.status(404).json({ message: 'Pedido não encontrado.' });
  if (terminalStatus.has(current.status) && current.status !== status) {
    return res.status(400).json({ message: 'Pedido finalizado não pode mudar de status.' });
  }

  const order = await prisma.order.update({ where: { id: req.params.id }, data: { status }, include: { items: true } });
  await prisma.auditLog.create({
    data: { action: 'ORDER_STATUS_UPDATED', entity: 'Order', entityId: order.id, metadata: { previousStatus: current.status, status }, userId: req.user.id }
  });
  res.json({ order: serializeOrder(order) });
}));

module.exports = router;
