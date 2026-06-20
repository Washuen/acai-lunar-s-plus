const DEFAULT_URL = 'https://acai-lunar-s-plus.onrender.com';
const BASE_URL = (process.env.PRODUCTION_BASE_URL || process.argv[2] || DEFAULT_URL).replace(/\/$/, '');

const owner = {
  email: process.env.PRODUCTION_OWNER_EMAIL || 'owner@acailunar.dev',
  password: process.env.PRODUCTION_OWNER_PASSWORD || '123456'
};

const customer = {
  email: process.env.PRODUCTION_CUSTOMER_EMAIL || 'cliente@acailunar.dev',
  password: process.env.PRODUCTION_CUSTOMER_PASSWORD || '123456'
};

function ok(message) { console.log(`✅ ${message}`); }
function step(message) { console.log(`\n🌙 ${message}`); }

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (_) { data = text; }

  if (!response.ok) {
    const message = data?.message || text || `HTTP ${response.status}`;
    throw new Error(`${options.method || 'GET'} ${path} -> ${response.status}: ${message}`);
  }
  return data;
}

async function login(credentials, label) {
  const data = await request('/api/auth/login', { method: 'POST', body: credentials });
  if (!data.token || !data.user) throw new Error(`Login ${label} não retornou token/user.`);
  ok(`Login ${label}: ${data.user.email} (${data.user.role})`);
  return data;
}

async function main() {
  console.log(`\nAçaí Lunar S+ — Production Full Check`);
  console.log(`URL: ${BASE_URL}\n`);

  step('Health');
  const health = await request('/api/health');
  if (!health.ok || health.database !== 'connected') throw new Error('/api/health não está conectado ao banco.');
  ok('API e banco em produção conectados.');

  step('Autenticação');
  const ownerSession = await login(owner, 'owner');
  const customerSession = await login(customer, 'cliente');

  step('Produtos e cupom');
  const productData = await request('/api/products', { token: customerSession.token });
  const product = productData.products.find(item => item.active && item.stock > 0 && Number(item.price) >= 18) ||
    productData.products.find(item => item.active && item.stock > 0);

  if (!product) throw new Error('Nenhum produto ativo com estoque encontrado em produção.');
  ok(`Produto disponível em produção: ${product.name}`);

  const couponData = await request('/api/coupons/validate', { method: 'POST', body: { code: 'LUNAR15' } });
  if (!couponData.valid) throw new Error('Cupom LUNAR15 não validou em produção.');
  ok('Cupom LUNAR15 validado.');

  step('Pedido real em produção');
  const orderData = await request('/api/orders', {
    method: 'POST',
    token: customerSession.token,
    body: {
      customerName: customerSession.user.name,
      customerEmail: customerSession.user.email,
      customerPhone: '81999999999',
      address: 'Rua Lunar, 100 - Recife, PE',
      notes: 'Pedido criado pelo production full check do Bloco 3.4',
      couponCode: 'LUNAR15',
      items: [{ productId: product.id, quantity: 1 }]
    }
  });

  const order = orderData.order;
  if (!order?.id) throw new Error('Pedido de produção não retornou id.');
  ok(`Pedido criado em produção: #${order.orderNumber}`);

  const mine = await request('/api/orders/mine', { token: customerSession.token });
  if (!mine.orders.some(item => item.id === order.id)) throw new Error('Pedido de produção não apareceu em /api/orders/mine.');
  ok('Pedido aparece na área do cliente.');

  step('Admin e status');
  const allOrders = await request('/api/orders', { token: ownerSession.token });
  if (!allOrders.orders.some(item => item.id === order.id)) throw new Error('Pedido de produção não apareceu no admin.');
  ok('Pedido aparece no admin.');

  const updated = await request(`/api/orders/${order.id}/status`, {
    method: 'PATCH',
    token: ownerSession.token,
    body: { status: 'PREPARING' }
  });

  if (updated.order.status !== 'PREPARING') throw new Error('Status de produção não atualizou para PREPARING.');
  ok('Owner atualizou status para Preparando.');

  const mineAfter = await request('/api/orders/mine', { token: customerSession.token });
  const synced = mineAfter.orders.find(item => item.id === order.id);
  if (synced?.status !== 'PREPARING') throw new Error('Cliente não recebeu status atualizado em produção.');
  ok('Cliente recebeu status atualizado.');

  step('Relatórios');
  const report = await request('/api/reports/summary', { token: ownerSession.token });
  if (!report || typeof report !== 'object') throw new Error('Relatório de produção inválido.');
  ok('Relatórios carregaram em produção.');

  console.log('\n🎉 Production full check aprovado: produção validada de ponta a ponta.\n');
}

main().catch(error => {
  console.error('\n❌ Production full check falhou.');
  console.error(error.message);
  console.error('\nConfira variáveis do Render, seed do Neon, estoque e credenciais demo.\n');
  process.exit(1);
});
