const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../lib/prisma');
const { asyncHandler } = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { cleanText, normalizeEmail, isValidEmail } = require('../utils/validators');

const router = express.Router();

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    active: user.active,
    createdAt: user.createdAt
  };
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

router.post('/register', asyncHandler(async (req, res) => {
  const name = cleanText(req.body.name);
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');
  const phone = cleanText(req.body.phone) || null;
  const address = cleanText(req.body.address) || null;

  if (name.length < 2) return res.status(400).json({ message: 'Informe um nome válido.' });
  if (!isValidEmail(email)) return res.status(400).json({ message: 'Informe um e-mail válido.' });
  if (password.length < 6) return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ message: 'E-mail já cadastrado.' });

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      address,
      password: await bcrypt.hash(password, 10),
      role: 'CUSTOMER',
      active: true
    }
  });

  await prisma.auditLog.create({
    data: { action: 'USER_REGISTERED', entity: 'User', entityId: user.id, userId: user.id, metadata: { email: user.email } }
  });

  res.status(201).json({ user: publicUser(user), token: signToken(user) });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');
  if (!isValidEmail(email) || !password) return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) return res.status(401).json({ message: 'Credenciais inválidas.' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Credenciais inválidas.' });

  await prisma.auditLog.create({
    data: { action: 'USER_LOGIN', entity: 'User', entityId: user.id, userId: user.id, metadata: { role: user.role } }
  });

  res.json({ user: publicUser(user), token: signToken(user) });
}));

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
}));

router.patch('/me', requireAuth, asyncHandler(async (req, res) => {
  const name = cleanText(req.body.name);
  const phone = cleanText(req.body.phone) || null;
  const address = cleanText(req.body.address) || null;

  if (name.length < 2) return res.status(400).json({ message: 'Informe um nome válido.' });
  if (phone && phone.length < 8) return res.status(400).json({ message: 'Informe um telefone válido.' });
  if (address && address.length < 5) return res.status(400).json({ message: 'Informe um endereço válido.' });

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, phone, address }
  });

  await prisma.auditLog.create({
    data: {
      action: 'CUSTOMER_PROFILE_UPDATED',
      entity: 'User',
      entityId: user.id,
      metadata: { source: 'customer_area' },
      userId: user.id
    }
  });

  res.json({ user: publicUser(user) });
}));

module.exports = router;
