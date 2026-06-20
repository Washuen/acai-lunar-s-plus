const express = require('express');
const { prisma } = require('../lib/prisma');
const { asyncHandler } = require('../utils/asyncHandler');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { cleanText, normalizeCouponCode, isValidCouponCode, parseOptionalDate, boolValue } = require('../utils/validators');

const router = express.Router();

function serializeCoupon(coupon) {
  return {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description,
    percentage: coupon.percentage,
    active: coupon.active,
    startsAt: coupon.startsAt,
    expiresAt: coupon.expiresAt,
    createdAt: coupon.createdAt,
    updatedAt: coupon.updatedAt
  };
}

function validateCouponWindow(startsAt, expiresAt) {
  if (startsAt === undefined || expiresAt === undefined) return 'Data inválida.';
  if (startsAt && expiresAt && startsAt > expiresAt) return 'A data de início não pode ser maior que a expiração.';
  return null;
}

router.get('/', requireAuth, requireAdmin, asyncHandler(async (_req, res) => {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ coupons: coupons.map(serializeCoupon) });
}));

router.post('/validate', asyncHandler(async (req, res) => {
  const code = normalizeCouponCode(req.body.code);
  if (!isValidCouponCode(code)) return res.status(400).json({ valid: false, message: 'Código de cupom inválido.' });
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.active) return res.status(404).json({ valid: false, message: 'Cupom inválido.' });
  const now = new Date();
  if ((coupon.startsAt && coupon.startsAt > now) || (coupon.expiresAt && coupon.expiresAt < now)) {
    return res.status(400).json({ valid: false, message: 'Cupom fora do período de uso.' });
  }
  res.json({ valid: true, coupon: { id: coupon.id, code: coupon.code, percentage: coupon.percentage } });
}));

router.post('/', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const code = normalizeCouponCode(req.body.code);
  const description = cleanText(req.body.description) || null;
  const percentage = Number(req.body.percentage);
  const startsAt = parseOptionalDate(req.body.startsAt);
  const expiresAt = parseOptionalDate(req.body.expiresAt);

  if (!isValidCouponCode(code)) return res.status(400).json({ message: 'Código inválido. Use 3 a 24 caracteres com letras, números, _ ou -.' });
  if (!Number.isInteger(percentage) || percentage < 1 || percentage > 90) return res.status(400).json({ message: 'Percentual inválido. Use de 1% a 90%.' });
  const dateError = validateCouponWindow(startsAt, expiresAt);
  if (dateError) return res.status(400).json({ message: dateError });

  const coupon = await prisma.coupon.create({
    data: {
      code,
      description,
      percentage,
      active: boolValue(req.body.active, true),
      startsAt,
      expiresAt
    }
  });
  await prisma.auditLog.create({ data: { action: 'COUPON_CREATED', entity: 'Coupon', entityId: coupon.id, userId: req.user.id, metadata: { code: coupon.code } } });
  res.status(201).json({ coupon: serializeCoupon(coupon) });
}));

router.patch('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const data = {};
  if (req.body.code !== undefined) {
    data.code = normalizeCouponCode(req.body.code);
    if (!isValidCouponCode(data.code)) return res.status(400).json({ message: 'Código inválido.' });
  }
  if (req.body.description !== undefined) data.description = cleanText(req.body.description) || null;
  if (req.body.percentage !== undefined) {
    data.percentage = Number(req.body.percentage);
    if (!Number.isInteger(data.percentage) || data.percentage < 1 || data.percentage > 90) return res.status(400).json({ message: 'Percentual inválido. Use de 1% a 90%.' });
  }
  if (req.body.active !== undefined) data.active = boolValue(req.body.active);
  if (req.body.startsAt !== undefined) data.startsAt = parseOptionalDate(req.body.startsAt);
  if (req.body.expiresAt !== undefined) data.expiresAt = parseOptionalDate(req.body.expiresAt);
  const dateError = validateCouponWindow(
    data.startsAt === undefined ? null : data.startsAt,
    data.expiresAt === undefined ? null : data.expiresAt
  );
  if ((req.body.startsAt !== undefined || req.body.expiresAt !== undefined) && dateError) return res.status(400).json({ message: dateError });

  const coupon = await prisma.coupon.update({ where: { id: req.params.id }, data });
  await prisma.auditLog.create({ data: { action: 'COUPON_UPDATED', entity: 'Coupon', entityId: coupon.id, userId: req.user.id, metadata: { code: coupon.code, fields: Object.keys(req.body) } } });
  res.json({ coupon: serializeCoupon(coupon) });
}));

module.exports = router;
