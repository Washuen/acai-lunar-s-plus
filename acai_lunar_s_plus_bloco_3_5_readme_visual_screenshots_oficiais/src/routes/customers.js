const express = require('express');
const { prisma } = require('../lib/prisma');
const { asyncHandler } = require('../utils/asyncHandler');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { cleanText, boolValue } = require('../utils/validators');

const router = express.Router();

router.get('/', requireAuth, requireAdmin, asyncHandler(async (_req, res) => {
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    select: { id: true, name: true, email: true, phone: true, active: true, createdAt: true, _count: { select: { orders: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ customers });
}));

router.patch('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const data = {};
  if (req.body.name !== undefined) {
    data.name = cleanText(req.body.name);
    if (data.name.length < 2) return res.status(400).json({ message: 'Nome inválido.' });
  }
  if (req.body.phone !== undefined) data.phone = cleanText(req.body.phone) || null;
  if (req.body.active !== undefined) data.active = boolValue(req.body.active);

  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target || target.role !== 'CUSTOMER') return res.status(404).json({ message: 'Cliente não encontrado.' });

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data,
    select: { id: true, name: true, email: true, phone: true, active: true, createdAt: true }
  });
  await prisma.auditLog.create({ data: { action: 'CUSTOMER_UPDATED_BY_ADMIN', entity: 'User', entityId: user.id, userId: req.user.id, metadata: { fields: Object.keys(data) } } });
  res.json({ customer: user });
}));

module.exports = router;
