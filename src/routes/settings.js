const express = require('express');
const { prisma } = require('../lib/prisma');
const { asyncHandler } = require('../utils/asyncHandler');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { cleanText, isValidMoney, boolValue } = require('../utils/validators');

const router = express.Router();

router.get('/store', asyncHandler(async (_req, res) => {
  const settings = await getSettings();
  res.json({ settings: serialize(settings) });
}));

router.put('/store', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const current = await getSettings();
  const data = {};
  if (req.body.storeName !== undefined) {
    data.storeName = cleanText(req.body.storeName);
    if (data.storeName.length < 2) return res.status(400).json({ message: 'Nome da loja inválido.' });
  }
  if (req.body.open !== undefined) data.open = boolValue(req.body.open);
  if (req.body.openingHours !== undefined) data.openingHours = cleanText(req.body.openingHours) || current.openingHours;
  if (req.body.deliveryFee !== undefined) {
    data.deliveryFee = Number(req.body.deliveryFee);
    if (!isValidMoney(data.deliveryFee, { min: 0, max: 99 })) return res.status(400).json({ message: 'Taxa de entrega inválida.' });
  }
  if (req.body.minimumOrder !== undefined) {
    data.minimumOrder = Number(req.body.minimumOrder);
    if (!isValidMoney(data.minimumOrder, { min: 0, max: 999 })) return res.status(400).json({ message: 'Pedido mínimo inválido.' });
  }
  if (req.body.estimatedTime !== undefined) data.estimatedTime = cleanText(req.body.estimatedTime) || current.estimatedTime;
  if (req.body.whatsapp !== undefined) data.whatsapp = cleanText(req.body.whatsapp) || null;

  const settings = await prisma.storeSetting.update({ where: { id: current.id }, data });
  await prisma.auditLog.create({
    data: { action: 'STORE_SETTINGS_UPDATED', entity: 'StoreSetting', entityId: settings.id, userId: req.user.id, metadata: { fields: Object.keys(data) } }
  });
  res.json({ settings: serialize(settings) });
}));

async function getSettings() {
  const found = await prisma.storeSetting.findFirst();
  if (found) return found;
  return prisma.storeSetting.create({ data: {} });
}

function serialize(settings) {
  return {
    ...settings,
    deliveryFee: Number(settings.deliveryFee),
    minimumOrder: Number(settings.minimumOrder)
  };
}

module.exports = router;
