const BASE_URL = process.env.SMOKE_BASE_URL || 'http://localhost:3333';

const owner = {
  email: process.env.SMOKE_OWNER_EMAIL || 'owner@acailunar.dev',
  password: process.env.SMOKE_OWNER_PASSWORD || '123456'
};

const customer = {
  email: process.env.SMOKE_CUSTOMER_EMAIL || 'cliente@acailunar.dev',
  password: process.env.SMOKE_CUSTOMER_PASSWORD || '123456'
};

function logOk(message) {
  console.log(`✅ ${message}`);
}

function logStep(message) {
  console.log(`\n🌙 ${message}`);
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {})
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (_) {
    data = text;
  }

  if (!response.ok) {
    const message = data?.message || data?.error || text || `HTTP ${response.status}`;
    throw new Error(`${options.method || 'GET'} ${path} -> ${response.status}: ${message}`);
  }

  return data;
}

async function login(credentials, label) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: credentials
  });

  if (!data.token || !data.user) throw new Error(`Login ${label} não retornou token/user.`);
  logOk(`Login ${label}: ${data.user.email} (${data.user.role})`);
  return data;
}

async function main() {
  console.log(`\nAçaí Lunar S+ — Smoke Test\nBase URL: ${BASE_URL}\n`);

  logStep('Health check');
  const health = await request('/api/health');
  if (!health.ok) throw new Error('Health check não retornou ok=true.');
  logOk('API e banco conectados.');

  logStep('Autenticação');
  const ownerSession = await login(owner, 'owner');
  const customerSession = await login(customer, 'cliente');

  const me = await request('/api/auth/me', { token: customerSession.token });
  if (me.user.email !== customer.email) throw new Error('GET /api/auth/me retornou usuário inesperado.');
  logOk('Sessão do cliente sincronizada em /api/auth/me.');

  logStep('Produtos e cupons');
  const productData = await request('/api/products', { token: customerSession.token });
  const product = productData.products.find(item => item.active && item.stock > 0 && Number(item.price) >= 18) ||
    productData.products.find(item => item.active && item.stock > 0);

  if (!product) throw new Error('Nenhum produto ativo com estoque encontrado para teste.');
  logOk(`Produto disponível: ${product.name} — R$ ${Number(product.price).toFixed(2)}`);

  const couponData = await request('/api/coupons/validate', {
    method: 'POST',
    body: { code: 'LUNAR15' }
  });
  if (!couponData.valid) throw new Error('Cupom LUNAR15 não validou.');
  logOk('Cupom LUNAR15 validado pela API.');

  logStep('Checkout real');
  const orderPayload = {
    customerName: customerSession.user.name,
    customerEmail: customerSession.user.email,
    customerPhone: '81999999999',
    address: 'Rua Lunar, 100 - Recife, PE',
    notes: 'Pedido criado pelo smoke test do Bloco 3.0',
    couponCode: 'LUNAR15',
    items: [
      {
        productId: product.id,
        quantity: 1
      }
    ]
  };

  const orderData = await request('/api/orders', {
    method: 'POST',
    token: customerSession.token,
    body: orderPayload
  });

  const order = orderData.order;
  if (!order?.id) throw new Error('Pedido não retornou id.');
  logOk(`Pedido criado: #${order.orderNumber} (${order.status})`);

  const mine = await request('/api/orders/mine', { token: customerSession.token });
  if (!mine.orders.some(item => item.id === order.id)) throw new Error('Pedido criado não apareceu em /api/orders/mine.');
  logOk('Pedido apareceu em Meus Pedidos.');

  logStep('Admin e status');
  const allOrders = await request('/api/orders', { token: ownerSession.token });
  if (!allOrders.orders.some(item => item.id === order.id)) throw new Error('Pedido criado não apareceu no admin.');
  logOk('Pedido apareceu no admin.');

  const updated = await request(`/api/orders/${order.id}/status`, {
    method: 'PATCH',
    token: ownerSession.token,
    body: { status: 'PREPARING' }
  });

  if (updated.order.status !== 'PREPARING') throw new Error('Status do pedido não foi atualizado para PREPARING.');
  logOk('Owner alterou status para Preparando.');

  const mineAfterStatus = await request('/api/orders/mine', { token: customerSession.token });
  const syncedOrder = mineAfterStatus.orders.find(item => item.id === order.id);
  if (syncedOrder?.status !== 'PREPARING') throw new Error('Cliente não recebeu status atualizado em /api/orders/mine.');
  logOk('Cliente recebeu status atualizado.');

  logStep('Relatórios');
  const report = await request('/api/reports/summary', { token: ownerSession.token });
  if (!report || typeof report !== 'object') throw new Error('Relatório summary inválido.');
  logOk('Relatórios administrativos responderam.');

  console.log('\n🎉 Smoke test aprovado: fluxo essencial fullstack estável.\n');
}

main().catch(error => {
  console.error('\n❌ Smoke test falhou.');
  console.error(error.message);
  console.error('\nVerifique se o servidor está rodando em http://localhost:3333, se o .env está configurado e se o seed foi executado.\n');
  process.exit(1);
});
