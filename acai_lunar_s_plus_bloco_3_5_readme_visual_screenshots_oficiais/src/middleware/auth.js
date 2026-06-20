const jwt = require('jsonwebtoken');
const { prisma } = require('../lib/prisma');

async function optionalAuth(req, _res, next) {
  const token = readToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (user && user.active) req.user = user;
  } catch (_) {
    // Optional auth never blocks public browsing.
  }
  next();
}

async function requireAuth(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ message: 'Autenticação necessária.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.active) return res.status(401).json({ message: 'Usuário inválido ou inativo.' });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || !['OWNER', 'ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Acesso administrativo necessário.' });
  }
  next();
}

function requireOwner(req, res, next) {
  if (!req.user || req.user.role !== 'OWNER') {
    return res.status(403).json({ message: 'Acesso restrito ao owner.' });
  }
  next();
}

function readToken(req) {
  const header = req.headers.authorization || '';
  if (!header) return null;
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token || token.length < 10) return null;
  return token;
}

module.exports = { optionalAuth, requireAuth, requireAdmin, requireOwner };
