const express = require('express');
const { prisma } = require('../lib/prisma');
const { asyncHandler } = require('../utils/asyncHandler');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

function toNumber(value) {
  return Number(value || 0);
}

function dayKey(value) {
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function statusLabel(status) {
  return ({
    RECEIVED: 'Pedido recebido',
    PREPARING: 'Preparando',
    OUT_FOR_DELIVERY: 'Saiu para entrega',
    DELIVERED: 'Entregue',
    CANCELED: 'Cancelado'
  })[status] || status;
}

router.get('/summary', requireAuth, requireAdmin, asyncHandler(async (_req, res) => {
  const [orders, products, customers, openOrders, recentAudit, coupons] = await Promise.all([
    prisma.order.findMany({
      include: { items: true, coupon: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200
    }),
    prisma.product.findMany({ include: { category: true } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.count({ where: { status: { in: ['RECEIVED', 'PREPARING', 'OUT_FOR_DELIVERY'] } } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 15, include: { user: { select: { name: true, email: true } } } }),
    prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
  ]);

  const revenue = orders.reduce((sum, order) => sum + toNumber(order.total), 0);
  const deliveredRevenue = orders
    .filter(order => order.status === 'DELIVERED')
    .reduce((sum, order) => sum + toNumber(order.total), 0);
  const averageTicket = orders.length ? revenue / orders.length : 0;
  const lowStock = products.filter(product => product.stock <= 8).map(product => ({
    id: product.id,
    name: product.name,
    stock: product.stock,
    category: product.category.name
  }));

  const byStatus = Object.entries(orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {})).map(([status, count]) => ({ status, label: statusLabel(status), count }));

  const dailyMap = new Map();
  orders.forEach(order => {
    const key = dayKey(order.createdAt);
    const current = dailyMap.get(key) || { label: key, revenue: 0, orders: 0 };
    current.revenue += toNumber(order.total);
    current.orders += 1;
    dailyMap.set(key, current);
  });
  const dailyRevenue = [...dailyMap.values()].reverse().slice(-10);

  const productMap = new Map();
  orders.forEach(order => {
    (order.items || []).forEach(item => {
      const current = productMap.get(item.name) || { name: item.name, quantity: 0, revenue: 0 };
      current.quantity += Number(item.quantity || 0);
      current.revenue += toNumber(item.unitPrice) * Number(item.quantity || 0);
      productMap.set(item.name, current);
    });
  });
  const topProducts = [...productMap.values()]
    .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
    .slice(0, 8);

  const couponMap = new Map();
  orders.forEach(order => {
    const code = order.coupon?.code || (toNumber(order.discount) > 0 ? 'Cupom aplicado' : null);
    if (!code) return;
    const current = couponMap.get(code) || { code, uses: 0, discount: 0, revenue: 0 };
    current.uses += 1;
    current.discount += toNumber(order.discount);
    current.revenue += toNumber(order.total);
    couponMap.set(code, current);
  });
  const couponUsage = [...couponMap.values()].sort((a, b) => b.uses - a.uses);

  const activeCoupons = coupons.filter(coupon => coupon.active).length;
  const inactiveProducts = products.filter(product => !product.active).length;
  const activeProducts = products.filter(product => product.active).length;
  const deliveredOrders = orders.filter(order => order.status === 'DELIVERED').length;
  const canceledOrders = orders.filter(order => order.status === 'CANCELED').length;

  res.json({
    summary: {
      revenue,
      deliveredRevenue,
      orders: orders.length,
      deliveredOrders,
      canceledOrders,
      averageTicket,
      customers,
      openOrders,
      lowStockCount: lowStock.length,
      activeProducts,
      inactiveProducts,
      activeCoupons
    },
    byStatus,
    dailyRevenue,
    topProducts,
    couponUsage,
    lowStock,
    recentOrders: orders.slice(0, 10).map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      total: toNumber(order.total),
      status: order.status,
      createdAt: order.createdAt,
      items: order.items?.map(item => ({ name: item.name, quantity: item.quantity })) || []
    })),
    recentAudit
  });
}));

module.exports = router;
