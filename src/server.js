require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const couponRoutes = require('./routes/coupons');
const customerRoutes = require('./routes/customers');
const settingRoutes = require('./routes/settings');
const reportRoutes = require('./routes/reports');
const { prisma } = require('./lib/prisma');

const app = express();
const PORT = Number(process.env.PORT || 3333);
const publicDir = path.join(__dirname, '..', 'public');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, service: 'Açaí Lunar API', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ ok: false, service: 'Açaí Lunar API', database: 'error', message: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/reports', reportRoutes);

app.use(express.static(publicDir));
app.get('*', (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));

app.use((error, _req, res, _next) => {
  console.error(error);

  if (error.code === 'P2002') {
    return res.status(409).json({ message: 'Registro duplicado. Verifique código, e-mail ou slug informado.' });
  }

  if (error.code === 'P2025') {
    return res.status(404).json({ message: 'Registro não encontrado.' });
  }

  res.status(error.status || 500).json({ message: error.message || 'Erro interno do servidor.' });
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Açaí Lunar S+ API running on port ${PORT}`);
});
