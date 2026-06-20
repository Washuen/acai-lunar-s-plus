const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const money = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const img = (file) => `assets/images_webp/${file}.webp`;

const API_BASE = window.ACAI_LUNAR_API_BASE || '';
const AUTH_TOKEN_KEY = 'acai_lunar_auth_token_v21';
const AUTH_USER_KEY = 'acai_lunar_auth_user_v21';
const LAST_ORDER_KEY = 'acai_lunar_last_order_v22';

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || 'null');
  } catch (_) {
    return null;
  }
}

function authHeaders() {
  return state.auth.token ? { Authorization: `Bearer ${state.auth.token}` } : {};
}

function readStoredOrder() {
  try {
    return JSON.parse(localStorage.getItem(LAST_ORDER_KEY) || 'null');
  } catch (_) {
    return null;
  }
}

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Erro de comunicação com a API.');
  return data;
}

function sameUserIdentity(a, b) {
  const first = a?.id || a?.email || null;
  const second = b?.id || b?.email || null;
  return first && second && String(first) === String(second);
}

function resetTrackedOrders() {
  state.lastOrder = null;
  state.myOrders = [];
  localStorage.removeItem(LAST_ORDER_KEY);
}

function saveSession(token, user) {
  const previousUser = state.auth.user;
  const changedUser = previousUser && user && !sameUserIdentity(previousUser, user);

  state.auth.token = token;
  state.auth.user = user;

  if (changedUser) {
    resetTrackedOrders();
  }

  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  document.documentElement.classList.remove('session-guest');
  document.documentElement.classList.add('session-cached');
  state.adminData = emptyAdminData();
  renderAuthState();
}

function clearSession(showMessage = true) {
  state.auth.token = null;
  state.auth.user = null;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  resetTrackedOrders();
  document.documentElement.classList.remove('session-cached');
  document.documentElement.classList.add('session-guest');
  state.adminData = emptyAdminData();
  renderAuthState();
  renderMyOrders();
  renderClientArea();
  renderTimeline();
  renderAdmin();
  if (showMessage) toast('Sessão encerrada.');
}

async function syncSessionFromApi() {
  if (!state.auth.token) {
    renderAuthState();
    return;
  }

  try {
    const data = await apiFetch('/api/auth/me');
    saveSession(state.auth.token, data.user);
  } catch (error) {
    console.warn('Sessão expirada ou inválida:', error.message);
    clearSession(false);
    toast('Sessão expirada. Faça login novamente.');
  }
}

async function loadProductsFromApi() {
  try {
    const data = await apiFetch('/api/products');
    if (Array.isArray(data.products) && data.products.length) {
      products = data.products.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        price: Number(product.price),
        image: product.image,
        tag: product.tag || 'Lunar',
        desc: product.desc || product.description || '',
        stock: product.stock,
        active: product.active,
        featured: product.featured
      }));
    }
  } catch (error) {
    console.warn('API indisponível. Usando dados locais do preview.', error.message);
  }
}

function getCheckoutPayload() {
  const user = state.auth.user;
  const customerName = $('#checkoutName')?.value.trim() || user?.name || 'Cliente Lunar';
  const customerPhone = $('#checkoutPhone')?.value.trim() || user?.phone || '(81) 99999-0000';
  const customerEmail = $('#checkoutEmail')?.value.trim() || user?.email || 'cliente@acailunar.dev';
  const address = $('#checkoutAddress')?.value.trim();
  const notes = $('#checkoutNotes')?.value.trim() || (user ? `Pedido criado por ${user.name}.` : 'Pedido criado pelo frontend Açaí Lunar S+.');

  if (!address) throw new Error('Informe o endereço de entrega antes de finalizar.');

  return {
    customerName,
    customerPhone,
    customerEmail,
    address,
    notes,
    couponCode: state.coupon?.code || undefined,
    items: state.cart.map(item => ({
      productId: item.custom ? null : item.id,
      name: item.name,
      quantity: item.qty,
      unitPrice: item.price,
      image: item.image,
      custom: Boolean(item.custom),
      metadata: item.custom ? { description: item.desc, source: 'builder', builder: true } : null
    }))
  };
}

async function createOrderFromApi() {
  const payload = getCheckoutPayload();
  return apiFetch('/api/orders', { method: 'POST', body: JSON.stringify(payload) });
}

async function loadMyOrdersFromApi() {
  if (!state.auth.token) {
    resetTrackedOrders();
    renderMyOrders();
    renderClientArea();
    renderTimeline();
    return;
  }
  try {
    const data = await apiFetch('/api/orders/mine');
    const orders = Array.isArray(data.orders) ? data.orders : [];
    state.myOrders = orders;

    if (orders.length) {
      const trackedId = state.lastOrder?.id;
      const updatedTrackedOrder = trackedId
        ? orders.find(order => String(order.id) === String(trackedId))
        : null;

      state.lastOrder = updatedTrackedOrder || orders[0];
      localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(state.lastOrder));
    } else {
      state.lastOrder = null;
      localStorage.removeItem(LAST_ORDER_KEY);
    }
  } catch (error) {
    console.warn('Não foi possível carregar meus pedidos:', error.message);
  }
  renderMyOrders();
  renderClientArea();
  renderTimeline();
}

const visualLibrary = [
  ['01_noite_tropical_com_bowls_de_acai','Home / hero alternativo'],
  ['02_acai_de_luxo_a_luz_da_lua','Produto destaque'],
  ['03_mesa_elegante_com_embalagem_de_delivery','Delivery / checkout'],
  ['04_taca_de_acai_sob_a_lua_cheia','Copo assinatura'],
  ['05_tigela_de_smoothie_fitness_com_detalhes','Fitness / proteico'],
  ['06_noite_de_sabores_e_acai_premium','Combo premium'],
  ['07_bowl_de_acai_sob_luz_suave','Bowl premium'],
  ['08_sob_a_lua_sobremesa_de_luxo','Edição especial'],
  ['09_sob_o_luar_sobremesa_tropical_sofisticada','Sobremesa tropical'],
  ['10_cafe_da_manha_gourmet_em_tons_escuros','Monte seu açaí'],
  ['11_cenario_tropical_noturno_com_acai','Hero principal'],
  ['12_acai_com_frutas_e_granola_ao_luar','Produto clássico'],
  ['13_noite_de_sabor_e_texturas','Ingredientes / toppings'],
  ['14_taca_de_acai_com_frutas_e_mel','Produto mel'],
  ['15_delicia_roxa_ao_luar','Copo / bebida'],
  ['16_sob_a_lua_sobremesas_tropicais_refinadas','Vitrine de cardápio'],
  ['17_acai_com_frutas_e_granola','Tradicional'],
  ['18_jantar_romantico_a_luz_de_velas','Branding / institucional'],
  ['19_acai_e_frutas_sob_a_luz_da_lua','Variedade'],
  ['20_sob_a_luz_da_lua_e_flores','Parfait elegante'],
  ['21_bowl_de_acai_com_frutas_tropicais','Frutas tropicais'],
  ['22_noite_luxuosa_com_delicias_de_acai','Combo família'],
  ['23_tigela_de_acai_sob_a_lua','Assinatura lunar'],
  ['24_sob_o_brilho_da_lua_e_frutas','Chocolate / brownie'],
  ['25_parfait_elegante_com_flores_e_luzes','Sobremesa premium'],
  ['26_tigela_de_acai_ao_estilo_gourmet','Gourmet'],
  ['27_parfait_noturno_com_toque_dourado','Parfait dourado'],
  ['28_sob_a_luz_da_lua_cheia','Conceitual lunar']
];

let products = [
  { id: 1, name: 'Eclipse Tropical', category: 'Bowls', price: 29.9, image: '02_acai_de_luxo_a_luz_da_lua', tag: 'Mais pedido', desc: 'Açaí premium, morango, banana, kiwi, granola, coco e mel lunar.' },
  { id: 2, name: 'Lua Cheia Clássico', category: 'Bowls', price: 24.9, image: '17_acai_com_frutas_e_granola', tag: 'Clássico', desc: 'Açaí cremoso com banana, morango, granola crocante e leite condensado.' },
  { id: 3, name: 'Aurora Fitness', category: 'Bowls', price: 31.9, image: '05_tigela_de_smoothie_fitness_com_detalhes', tag: 'Proteico', desc: 'Base de açaí com pasta de amendoim, banana, granola e toque funcional.' },
  { id: 4, name: 'Constelação Gourmet', category: 'Bowls', price: 34.9, image: '26_tigela_de_acai_ao_estilo_gourmet', tag: 'Gourmet', desc: 'Morango, banana, coco, granola premium e calda artesanal.' },
  { id: 5, name: 'Nebulosa de Chocolate', category: 'Bowls', price: 36.9, image: '24_sob_o_brilho_da_lua_e_frutas', tag: 'Chocolate', desc: 'Açaí, brownie, chocolate, morango, banana e granola.' },
  { id: 6, name: 'Lunar Cup Dourado', category: 'Copos', price: 27.9, image: '27_parfait_noturno_com_toque_dourado', tag: 'Parfait', desc: 'Copo em camadas com açaí, granola, creme e frutas frescas.' },
  { id: 7, name: 'Orquídea Roxa', category: 'Copos', price: 30.9, image: '25_parfait_elegante_com_flores_e_luzes', tag: 'Premium', desc: 'Parfait elegante com frutas vermelhas, flores comestíveis e crocância.' },
  { id: 8, name: 'Smoothie Delícia Roxa', category: 'Bebidas', price: 22.9, image: '15_delicia_roxa_ao_luar', tag: 'Bebida', desc: 'Smoothie gelado de açaí com textura cremosa e topping crocante.' },
  { id: 9, name: 'Noite para Dois', category: 'Combos', price: 54.9, image: '06_noite_de_sabores_e_acai_premium', tag: 'Combo', desc: 'Dois produtos premium para compartilhar sob a luz da lua.' },
  { id: 10, name: 'Trio Família Lunar', category: 'Combos', price: 79.9, image: '22_noite_luxuosa_com_delicias_de_acai', tag: 'Família', desc: 'Combo de bowls e copos para uma experiência completa.' },
  { id: 11, name: 'Especial Lua de Chocolate', category: 'Especiais', price: 39.9, image: '08_sob_a_lua_sobremesa_de_luxo', tag: 'Limitado', desc: 'Edição especial com chocolate, creme, morangos e cobertura intensa.' },
  { id: 12, name: 'Mini Lunar', category: 'Mini', price: 16.9, image: '09_sob_o_luar_sobremesa_tropical_sofisticada', tag: 'Mini', desc: 'Porção delicada para provar sem perder o visual premium.' }
];

const builder = {
  size: [
    { label: '300ml', price: 14.9 },
    { label: '500ml', price: 20.9 },
    { label: '700ml', price: 26.9 },
    { label: '1L', price: 35.9 }
  ],
  base: [
    { label: 'Tradicional', price: 0 },
    { label: 'Zero açúcar', price: 2 },
    { label: 'Cupuaçu', price: 3 },
    { label: 'Proteico', price: 5 }
  ],
  addons: [
    { label: 'Morango', price: 3.5 },
    { label: 'Banana', price: 2.5 },
    { label: 'Granola', price: 3 },
    { label: 'Leite em pó', price: 3 },
    { label: 'Paçoca', price: 2.5 },
    { label: 'Nutella', price: 5 },
    { label: 'Mel', price: 3 },
    { label: 'Kiwi', price: 4 }
  ]
};

const state = {
  category: 'Todos',
  search: '',
  cart: JSON.parse(localStorage.getItem('acai_lunar_cart_v12') || '[]'),
  coupon: null,
  builder: { size: builder.size[1], base: builder.base[0], addons: [] },
  trackingStep: 1,
  lastOrder: readStoredOrder(),
  myOrders: [],
  adminTab: 'Resumo',
  clientTab: 'Resumo',
  auth: {
    token: localStorage.getItem(AUTH_TOKEN_KEY),
    user: readStoredUser()
  },
  adminData: emptyAdminData(),
  editingProductId: null,
  editingCouponId: null,
  adminFilters: {
    orderStatus: 'ALL',
    orderSearch: '',
    productStatus: 'ALL',
    productSearch: '',
    customerSearch: '',
    reportMode: 'overview'
  }
};

function toast(message, type = 'info') {
  const toastEl = $('#toast');
  toastEl.textContent = message;
  toastEl.dataset.type = type;
  toastEl.classList.add('show');
  clearTimeout(toastEl._timer);
  toastEl._timer = setTimeout(() => toastEl.classList.remove('show'), 2600);
}

function setButtonBusy(button, isBusy, label = 'Processando...') {
  if (!button) return;
  if (isBusy) {
    button.dataset.originalText = button.dataset.originalText || button.textContent;
    button.textContent = label;
    button.disabled = true;
    button.classList.add('is-loading');
    return;
  }
  button.textContent = button.dataset.originalText || button.textContent;
  button.disabled = false;
  button.classList.remove('is-loading');
  delete button.dataset.originalText;
}

async function withButtonBusy(button, task, label = 'Processando...') {
  if (button?.disabled) return;
  setButtonBusy(button, true, label);
  try {
    return await task();
  } finally {
    setButtonBusy(button, false);
  }
}

function closeConfirmModal(result) {
  const modal = $('#confirmModal');
  if (!modal || !modal._resolver) return;
  const resolver = modal._resolver;
  modal._resolver = null;
  if (modal.open) modal.close();
  resolver(result);
}

function confirmAction(message, options = {}) {
  const modal = $('#confirmModal');
  if (!modal) return Promise.resolve(window.confirm(message));

  const {
    title = 'Confirmar ação',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    tone = 'warning'
  } = options;

  $('#confirmTitle').textContent = title;
  $('#confirmMessage').textContent = message;
  $('[data-confirm-accept]').textContent = confirmText;
  $('[data-confirm-cancel]').textContent = cancelText;
  modal.querySelector('.confirm-shell')?.setAttribute('data-confirm-tone', tone);

  if (modal._resolver && modal.open) {
    modal._resolver(false);
  }

  return new Promise((resolve) => {
    modal._resolver = resolve;
    modal.showModal();
  });
}

function isAdminUser() {
  return ['OWNER', 'ADMIN'].includes(state.auth.user?.role);
}

function hydrateCheckoutForm() {
  const user = state.auth.user;
  if ($('#checkoutName') && user) $('#checkoutName').value = user.name || '';
  if ($('#checkoutEmail') && user) $('#checkoutEmail').value = user.email || '';
  if ($('#checkoutPhone') && user?.phone) $('#checkoutPhone').value = user.phone;
  if ($('#checkoutAddress') && !$('#checkoutAddress').value) $('#checkoutAddress').value = user?.address || 'Rua Lunar, 100 - Recife, PE';
  const hint = $('#checkoutHint');
  if (hint) hint.textContent = user
    ? `Pedido será vinculado à sessão de ${user.name}.`
    : 'Entre na sua conta para salvar e acompanhar pedidos reais no banco.';
}

function orderStatusLabel(status) {
  return ({
    RECEIVED: 'Pedido recebido',
    PREPARING: 'Preparando',
    OUT_FOR_DELIVERY: 'Saiu para entrega',
    DELIVERED: 'Entregue',
    CANCELED: 'Cancelado'
  })[status] || 'Pedido recebido';
}

function stepFromStatus(status) {
  return ({ RECEIVED: 0, PREPARING: 1, OUT_FOR_DELIVERY: 2, DELIVERED: 3, CANCELED: 0 })[status] ?? state.trackingStep;
}

function nextOrderStatus(status) {
  const flow = ['RECEIVED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const currentIndex = flow.indexOf(status);
  if (currentIndex === -1) return 'RECEIVED';
  return flow[Math.min(currentIndex + 1, flow.length - 1)];
}

function renderAuthState() {
  document.documentElement.classList.add('auth-ready');
  const user = state.auth.user;
  const buttons = $$('[data-open-auth]');
  buttons.forEach(button => {
    if (!user) {
      button.textContent = button.dataset.loggedOutLabel || 'Entrar';
      button.classList.remove('session-active');
      button.removeAttribute('data-logout');
      return;
    }

    const firstName = user.name?.split(' ')[0] || user.email;
    button.textContent = button.dataset.adminLogin ? `${firstName} • Sair` : `${firstName} • Sair`;
    button.classList.add('session-active');
    button.setAttribute('data-logout', 'true');
  });

  const sessionBadge = $('#sessionBadge');
  if (sessionBadge) {
    sessionBadge.innerHTML = user
      ? `<strong>${user.name}</strong><span>${user.role === 'OWNER' ? 'Owner/admin' : 'Cliente'} conectado • ${user.email}</span>`
      : `<strong>Visitante</strong><span>Entre para sincronizar pedidos e acesso admin com a API.</span>`;
    sessionBadge.classList.toggle('logged', Boolean(user));
  }

  const authStatus = $('#authStatus');
  if (authStatus) {
    authStatus.textContent = user
      ? `Sessão ativa como ${user.name} (${user.role}).`
      : 'Nenhuma sessão ativa.';
  }
  hydrateCheckoutForm();
  renderClientArea();
}

async function submitLogin() {
  const loginButton = $('#loginBtn');
  const email = $('#authEmail').value.trim();
  const password = $('#authPassword').value;
  if (!email || !password) return toast('Informe e-mail e senha.');

  setButtonBusy(loginButton, true, 'Entrando...');
  try {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    saveSession(data.token, data.user);
    $('#authModal').close();
    await loadMyOrdersFromApi();
    if (isAdminUser()) await loadAdminDataFromApi(true);
    renderAdmin();
    toast(`Bem-vindo, ${data.user.name}.`);
  } catch (error) {
    toast(error.message);
  } finally {
    setButtonBusy(loginButton, false);
  }
}

async function submitRegister() {
  const registerButton = $('#registerBtn');
  const name = $('#authName').value.trim() || 'Cliente Lunar';
  const email = $('#authEmail').value.trim();
  const password = $('#authPassword').value;
  if (!email || !password) return toast('Informe e-mail e senha para criar conta.');

  setButtonBusy(registerButton, true, 'Criando...');
  try {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    saveSession(data.token, data.user);
    $('#authModal').close();
    await loadMyOrdersFromApi();
    if (isAdminUser()) await loadAdminDataFromApi(true);
    renderAdmin();
    toast(`Conta criada, ${data.user.name}.`);
  } catch (error) {
    toast(error.message);
  } finally {
    setButtonBusy(registerButton, false);
  }
}

function fillDemoCredentials(type) {
  if (type === 'owner') {
    $('#authEmail').value = 'owner@acailunar.dev';
    $('#authPassword').value = '123456';
    $('#authName').value = 'Owner Açaí Lunar';
    toast('Credenciais owner preenchidas.');
    return;
  }

  $('#authEmail').value = 'cliente@acailunar.dev';
  $('#authPassword').value = '123456';
  $('#authName').value = 'Cliente Lunar';
  toast('Credenciais cliente preenchidas.');
}

function renderCategories() {
  const categories = ['Todos', ...new Set(products.map(product => product.category))];
  $('#categoryTabs').innerHTML = categories.map(category => `
    <button class="${state.category === category ? 'active' : ''}" data-category="${category}">${category}</button>
  `).join('');
}

function renderProducts() {
  const filtered = products.filter(product => {
    const matchCategory = state.category === 'Todos' || product.category === state.category;
    const query = `${product.name} ${product.category} ${product.desc}`.toLowerCase();
    return matchCategory && query.includes(state.search.toLowerCase());
  });

  $('#productGrid').innerHTML = filtered.map(product => `
    <article class="product-card">
      <div class="image-wrap">
        <img src="${img(product.image)}" alt="${product.name}" loading="lazy">
        <span class="product-tag">${product.tag}</span>
        <button class="favorite-btn" title="Favoritar ${product.name}" data-favorite="${product.id}">♡</button>
      </div>
      <div class="product-body">
        <div class="product-kicker"><span>${product.category}</span><span>Entrega 35–50 min</span></div>
        <h3>${product.name}</h3>
        <p>${product.desc}</p>
        <div class="product-footer">
          <strong>${money(product.price)}</strong>
          <button data-add-product="${product.id}">Adicionar</button>
        </div>
      </div>
    </article>
  `).join('') || '<p class="empty">Nenhum produto encontrado. Tente outra busca ou categoria.</p>';
}

function renderBuilder() {
  Object.keys(builder).forEach(type => {
    const container = document.querySelector(`[data-builder="${type}"]`);
    container.innerHTML = builder[type].map(option => {
      const active = type === 'addons'
        ? state.builder.addons.some(addon => addon.label === option.label)
        : state.builder[type].label === option.label;
      return `<button class="${active ? 'active' : ''}" data-builder-type="${type}" data-builder-label="${option.label}">${option.label} ${option.price ? `+${money(option.price)}` : ''}</button>`;
    }).join('');
  });

  const total = state.builder.size.price + state.builder.base.price + state.builder.addons.reduce((sum, item) => sum + item.price, 0);
  $('#builderTotal').textContent = money(total);
  const selected = [state.builder.size.label, state.builder.base.label, ...state.builder.addons.map(a => a.label)];
  $('#builderSelected').innerHTML = selected.map(item => `<span>${item}</span>`).join('');
}


function addToCart(product) {
  const existing = state.cart.find(item => item.id === product.id && item.custom !== true);
  if (existing) existing.qty += 1;
  else state.cart.push({ ...product, qty: 1 });
  renderCart();
  toast('Adicionado ao carrinho.');
}

function addCustomBowl() {
  const total = state.builder.size.price + state.builder.base.price + state.builder.addons.reduce((sum, item) => sum + item.price, 0);
  const name = `Meu Bowl Lunar ${state.builder.size.label}`;
  const desc = `${state.builder.base.label} + ${state.builder.addons.map(a => a.label).join(', ') || 'sem adicionais'}`;
  state.cart.push({
    id: `custom-${Date.now()}`,
    name,
    category: 'Personalizado',
    price: total,
    image: '10_cafe_da_manha_gourmet_em_tons_escuros',
    desc,
    tag: 'Custom',
    qty: 1,
    custom: true
  });
  renderCart();
  toast('Bowl personalizado adicionado.');
}

function persistCart() {
  localStorage.setItem('acai_lunar_cart_v12', JSON.stringify(state.cart));
}

function renderCart() {
  persistCart();
  $('#cartCount').textContent = state.cart.reduce((sum, item) => sum + item.qty, 0);
  $('#cartItems').innerHTML = state.cart.map(item => `
    <article class="cart-item">
      <img src="${img(item.image)}" alt="${item.name}" loading="lazy">
      <div>
        <strong>${item.name}</strong>
        <span>${money(item.price)} cada</span>
        <small>${item.desc || item.category}</small>
      </div>
      <div class="qty-controls">
        <button data-change-qty="${item.id}" data-delta="-1">−</button>
        <b>${item.qty}</b>
        <button data-change-qty="${item.id}" data-delta="1">+</button>
        <button class="remove-mini" data-remove-item="${item.id}">×</button>
      </div>
    </article>
  `).join('') || '<p class="empty">Seu carrinho está vazio. Adicione um bowl para começar.</p>';

  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = subtotal > 0 ? 6.9 : 0;
  const couponPercentage = state.coupon ? Number(state.coupon.percentage || 0) : 0;
  const discount = state.coupon ? subtotal * (couponPercentage / 100) : 0;
  const total = Math.max(0, subtotal + delivery - discount);
  $('#cartTotal').innerHTML = `
    <div><span>Subtotal</span><strong>${money(subtotal)}</strong></div>
    <div><span>Entrega estimada</span><strong>${money(delivery)}</strong></div>
    <div><span>Cupom ${state.coupon?.code || '—'}</span><strong>- ${money(discount)}</strong></div>
    <div class="grand-total"><span>Total</span><strong>${money(total)}</strong></div>
  `;
}

function renderTimeline() {
  const steps = [
    ['Pedido recebido', 'Seu pedido entrou na central lunar.'],
    ['Preparando', 'A equipe está montando seu açaí.'],
    ['Saiu para entrega', 'O pedido está indo até você.'],
    ['Entregue', 'Aproveite sua noite lunar.']
  ];
  const order = state.lastOrder;
  const currentStep = order ? stepFromStatus(order.status) : state.trackingStep;
  $('#timeline').innerHTML = steps.map((step, index) => `
    <article class="${index <= currentStep ? 'active' : ''}">
      <strong>${String(index + 1).padStart(2, '0')} • ${step[0]}</strong>
      <span>${step[1]}</span>
    </article>
  `).join('');
}

function renderMyOrders() {
  const panel = $('#myOrdersPanel');
  if (!panel) return;
  const order = state.lastOrder;
  const orders = state.myOrders || [];
  if (!state.auth.user) {
    panel.innerHTML = `<div class="orders-card"><strong>Entre para acompanhar pedidos reais</strong><p>O checkout já cria pedidos na API. Com sessão ativa, seus pedidos ficam vinculados ao usuário.</p></div>`;
    return;
  }
  if (!orders.length && !order) {
    panel.innerHTML = `<div class="orders-card"><strong>Nenhum pedido real ainda</strong><p>Finalize um carrinho para salvar o pedido no PostgreSQL e acompanhar por aqui.</p></div>`;
    return;
  }
  panel.innerHTML = `
    <div class="orders-card featured-order">
      <strong>${order ? `Último pedido #${order.orderNumber}` : 'Pedidos reais'}</strong>
      <p>${order ? `${orderStatusLabel(order.status)} • Total ${money(Number(order.total || 0))}` : 'Pedidos carregados da API.'}</p>
      ${order?.items?.length ? `<small>${order.items.map(item => `${item.quantity}x ${item.name}`).join(' • ')}</small>` : ''}
    </div>
    <div class="orders-list">
      ${orders.slice(0, 4).map(item => `
        <article>
          <span>#${item.orderNumber}</span>
          <strong>${orderStatusLabel(item.status)}</strong>
          <small>${money(Number(item.total || 0))}</small>
        </article>
      `).join('')}
    </div>`;
}


function clientSummary() {
  const orders = state.myOrders || [];
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const delivered = orders.filter(order => order.status === 'DELIVERED').length;
  const open = orders.filter(order => !['DELIVERED', 'CANCELED'].includes(order.status)).length;
  const favorite = orders.flatMap(order => order.items || []).reduce((acc, item) => {
    acc[item.name] = (acc[item.name] || 0) + Number(item.quantity || 0);
    return acc;
  }, {});
  const topItem = Object.entries(favorite).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Nenhum pedido ainda';
  return { ordersCount: orders.length, totalSpent, delivered, open, topItem };
}

function renderClientArea() {
  const sidebar = $('#clientSidebar');
  const content = $('#clientContent');
  if (!sidebar || !content) return;

  const tabs = ['Resumo', 'Pedidos', 'Perfil', 'Cupons'];
  sidebar.innerHTML = tabs.map(tab => `<button class="${state.clientTab === tab ? 'active' : ''}" data-client-tab="${tab}">${tab}</button>`).join('');

  if (!state.auth.user) {
    content.innerHTML = `
      <div class="client-empty">
        <strong>Entre para abrir sua área lunar</strong>
        <p>Ao fazer login, seus pedidos reais, endereço e dados de entrega ficam sincronizados com a API.</p>
        <button class="primary-btn" data-open-auth>Entrar ou criar conta</button>
      </div>`;
    return;
  }

  if (state.clientTab === 'Resumo') return renderClientResumo();
  if (state.clientTab === 'Pedidos') return renderClientPedidos();
  if (state.clientTab === 'Perfil') return renderClientPerfil();
  if (state.clientTab === 'Cupons') return renderClientCupons();
}

function renderClientResumo() {
  const content = $('#clientContent');
  const user = state.auth.user;
  const summary = clientSummary();
  const last = state.myOrders?.[0];
  content.innerHTML = `
    <div class="client-hero-card">
      <div>
        <span class="eyebrow">Bem-vindo de volta</span>
        <h3>${user.name}</h3>
        <p>${user.email} • ${user.phone || 'telefone não informado'}</p>
      </div>
      <button class="secondary-btn" data-client-tab="Perfil">Editar perfil</button>
    </div>
    <div class="client-stats">
      <article><strong>${summary.ordersCount}</strong><span>Pedidos reais</span></article>
      <article><strong>${money(summary.totalSpent)}</strong><span>Total consumido</span></article>
      <article><strong>${summary.open}</strong><span>Em andamento</span></article>
      <article><strong>${summary.delivered}</strong><span>Entregues</span></article>
    </div>
    <div class="client-grid-2">
      <article class="client-card">
        <strong>Último pedido</strong>
        ${last ? `<p>#${last.orderNumber} • ${orderStatusLabel(last.status)}</p><small>${money(Number(last.total || 0))} • ${(last.items || []).map(item => `${item.quantity}x ${item.name}`).join(' • ')}</small>` : '<p>Nenhum pedido criado ainda.</p>'}
      </article>
      <article class="client-card">
        <strong>Endereço salvo</strong>
        <p>${user.address || 'Nenhum endereço salvo ainda.'}</p>
        <small>Esse endereço é usado automaticamente no checkout.</small>
      </article>
      <article class="client-card">
        <strong>Favorito provável</strong>
        <p>${summary.topItem}</p>
        <small>Baseado no seu histórico de pedidos reais.</small>
      </article>
      <article class="client-card">
        <strong>Cupom sugerido</strong>
        <p>LUNAR15</p>
        <small>Use no carrinho ou crie campanhas pelo painel admin.</small>
      </article>
    </div>`;
}

function renderClientPedidos() {
  const content = $('#clientContent');
  const orders = state.myOrders || [];
  content.innerHTML = `
    <div class="client-header-row">
      <div><strong>Meus pedidos reais</strong><span>Histórico sincronizado com PostgreSQL.</span></div>
      <button class="secondary-btn" id="refreshClientOrders">Atualizar pedidos</button>
    </div>
    <div class="client-orders-real">
      ${orders.map(order => `
        <article class="client-order-card">
          <div class="order-main-line"><strong>#${order.orderNumber}</strong><span class="status-pill">${orderStatusLabel(order.status)}</span></div>
          <p>${serializeDate(order.createdAt)} • ${money(Number(order.total || 0))}</p>
          <small>${(order.items || []).map(item => `${item.quantity}x ${item.name}`).join(' • ')}</small>
          <div class="client-order-actions">
            <button data-repeat-order="${order.id}">Repetir pedido</button>
            <button data-track-order="${order.id}">Acompanhar</button>
          </div>
        </article>`).join('') || '<div class="client-empty"><strong>Nenhum pedido ainda</strong><p>Finalize um checkout para o pedido aparecer aqui automaticamente.</p></div>'}
    </div>`;
}

function renderClientPerfil() {
  const content = $('#clientContent');
  const user = state.auth.user;
  content.innerHTML = `
    <form class="client-profile-form" id="clientProfileForm">
      <h3>Perfil e entrega</h3>
      <p>Atualize seus dados reais. O endereço salvo preenche o checkout automaticamente.</p>
      <label>Nome<input name="name" value="${user.name || ''}" required></label>
      <label>Telefone<input name="phone" value="${user.phone || ''}" placeholder="(81) 99999-0000"></label>
      <label class="full">Endereço salvo<textarea name="address" placeholder="Rua, número, bairro, cidade">${user.address || ''}</textarea></label>
      <div class="form-actions"><button class="primary-btn" type="submit">Salvar perfil</button><button class="secondary-btn" type="button" data-fill-checkout-from-profile="true">Usar no checkout</button></div>
    </form>`;
}

function renderClientCupons() {
  const content = $('#clientContent');
  const coupons = state.adminData?.coupons?.length ? state.adminData.coupons : [{ code: 'LUNAR15', percentage: 15, description: 'Cupom oficial do Açaí Lunar.' }];
  content.innerHTML = `
    <div class="client-header-row"><div><strong>Cupons disponíveis</strong><span>Campanhas ativas para usar no carrinho.</span></div></div>
    <div class="client-coupon-grid">
      ${coupons.filter(coupon => coupon.active !== false).slice(0, 8).map(coupon => `
        <article class="client-coupon-card">
          <span>${coupon.code}</span>
          <strong>${Number(coupon.percentage || 0)}% OFF</strong>
          <p>${coupon.description || 'Cupom ativo para pedidos selecionados.'}</p>
          <button data-use-coupon="${coupon.code}">Usar cupom</button>
        </article>`).join('')}
    </div>`;
}

async function updateClientProfile(form) {
  const submitButton = form.querySelector('button[type="submit"]');
  const payload = Object.fromEntries(new FormData(form).entries());
  setButtonBusy(submitButton, true, 'Salvando...');
  try {
    const data = await apiFetch('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    saveSession(state.auth.token, data.user);
    hydrateCheckoutForm();
    toast('Perfil atualizado e sincronizado.');
    renderClientArea();
  } catch (error) {
    toast(error.message || 'Não foi possível atualizar o perfil.');
  } finally {
    setButtonBusy(submitButton, false);
  }
}

function repeatOrder(orderId) {
  const order = (state.myOrders || []).find(item => item.id === orderId);
  if (!order) return toast('Pedido não encontrado.');
  for (const item of order.items || []) {
    state.cart.push({
      id: item.custom ? `repeat-${item.id}-${Date.now()}` : item.id,
      name: item.name,
      category: item.custom ? 'Personalizado' : 'Repetido',
      price: Number(item.unitPrice || 0),
      image: item.image || '02_acai_de_luxo_a_luz_da_lua',
      desc: item.custom ? 'Item personalizado repetido do histórico.' : 'Item repetido do histórico.',
      tag: item.custom ? 'Custom' : 'Repetir',
      qty: Number(item.quantity || 1),
      custom: Boolean(item.custom)
    });
  }
  renderCart();
  $('#cartDrawer').classList.add('open');
  $('#overlay').classList.add('open');
  toast(`Pedido #${order.orderNumber} adicionado ao carrinho.`);
}

function trackClientOrder(orderId) {
  const order = (state.myOrders || []).find(item => item.id === orderId);
  if (!order) return toast('Pedido não encontrado.');
  state.lastOrder = order;
  localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
  renderTimeline();
  renderMyOrders();
  location.hash = '#tracking';
  toast(`Acompanhando pedido #${order.orderNumber}.`);
}

function fillCheckoutFromProfile() {
  const user = state.auth.user;
  if (!user) return;
  if ($('#checkoutName')) $('#checkoutName').value = user.name || '';
  if ($('#checkoutPhone')) $('#checkoutPhone').value = user.phone || '';
  if ($('#checkoutEmail')) $('#checkoutEmail').value = user.email || '';
  if ($('#checkoutAddress')) $('#checkoutAddress').value = user.address || '';
  toast('Dados do perfil enviados para o checkout.');
}

function renderGallery() {
  $('#galleryGrid').innerHTML = visualLibrary.map(([file, use], index) => `
    <article class="gallery-item">
      <img src="${img(file)}" alt="${use}" loading="lazy">
      <button data-open-image="${file}" data-title="${String(index + 1).padStart(2,'0')} ${file}" data-use="${use}">
        <small>${String(index + 1).padStart(2,'0')}</small>
        <span>${use}</span>
      </button>
    </article>
  `).join('');
}


const ORDER_STATUS_OPTIONS = [
  ['RECEIVED', 'Recebido'],
  ['PREPARING', 'Preparando'],
  ['OUT_FOR_DELIVERY', 'Saiu para entrega'],
  ['DELIVERED', 'Entregue'],
  ['CANCELED', 'Cancelado']
];

function emptyAdminData() {
  return {
    summary: null,
    orders: [],
    products: [],
    coupons: [],
    categories: [],
    customers: [],
    lowStock: [],
    recentAudit: [],
    byStatus: [],
    dailyRevenue: [],
    topProducts: [],
    couponUsage: [],
    loading: false,
    loaded: false,
    error: null
  };
}

function serializeDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function statusOptions(order) {
  return ORDER_STATUS_OPTIONS.map(([value, label]) => `
    <button class="${order.status === value ? 'active' : ''}" data-order-status="${value}" data-order-id="${order.id}">${label}</button>
  `).join('');
}

function adminFilterValue(name) {
  return state.adminFilters?.[name] || '';
}

function filterOrdersForAdmin(orders) {
  const status = adminFilterValue('orderStatus') || 'ALL';
  const search = adminFilterValue('orderSearch').trim().toLowerCase();
  return (orders || []).filter(order => {
    const matchesStatus = status === 'ALL' || order.status === status;
    const haystack = [order.orderNumber, order.customerName, order.customerEmail, order.address, ...(order.items || []).map(item => item.name)].join(' ').toLowerCase();
    return matchesStatus && (!search || haystack.includes(search));
  });
}

function filterProductsForAdmin(items) {
  const status = adminFilterValue('productStatus') || 'ALL';
  const search = adminFilterValue('productSearch').trim().toLowerCase();
  return (items || []).filter(product => {
    const stock = Number(product.stock || 0);
    const matchesStatus = status === 'ALL'
      || (status === 'ACTIVE' && product.active !== false)
      || (status === 'INACTIVE' && product.active === false)
      || (status === 'LOW_STOCK' && stock <= 8)
      || (status === 'FEATURED' && product.featured);
    const haystack = [product.name, product.category, product.tag, product.description].join(' ').toLowerCase();
    return matchesStatus && (!search || haystack.includes(search));
  });
}

function filterCustomersForAdmin(customers) {
  const search = adminFilterValue('customerSearch').trim().toLowerCase();
  return (customers || []).filter(customer => {
    const haystack = [customer.name, customer.email, customer.phone, customer.address].join(' ').toLowerCase();
    return !search || haystack.includes(search);
  });
}

function barWidth(value, max) {
  if (!max) return 0;
  return Math.max(4, Math.min(100, Math.round((Number(value || 0) / max) * 100)));
}

async function loadAdminDataFromApi(force = false) {
  if (!isAdminUser()) {
    state.adminData = emptyAdminData();
    return;
  }
  if (state.adminData?.loading) return;
  if (state.adminData?.loaded && !force) return;

  state.adminData.loading = true;
  state.adminData.error = null;
  renderAdmin();

  try {
    const [ordersData, productsData, categoriesData, couponsData, customersData, reportsData] = await Promise.all([
      apiFetch('/api/orders'),
      apiFetch('/api/products?includeInactive=true'),
      apiFetch('/api/products/categories?includeInactive=true'),
      apiFetch('/api/coupons'),
      apiFetch('/api/customers'),
      apiFetch('/api/reports/summary')
    ]);

    state.adminData = {
      summary: reportsData.summary || null,
      orders: ordersData.orders || [],
      products: (productsData.products || []).map(product => ({ ...product, price: Number(product.price) })),
      categories: categoriesData.categories || [],
      coupons: couponsData.coupons || [],
      customers: customersData.customers || [],
      lowStock: reportsData.lowStock || [],
      recentAudit: reportsData.recentAudit || [],
      byStatus: reportsData.byStatus || [],
      dailyRevenue: reportsData.dailyRevenue || [],
      topProducts: reportsData.topProducts || [],
      couponUsage: reportsData.couponUsage || [],
      loading: false,
      loaded: true,
      error: null
    };
  } catch (error) {
    console.warn('Falha ao carregar admin real:', error.message);
    state.adminData.loading = false;
    state.adminData.error = error.message;
  }
  renderAdmin();
}

async function updateOrderStatus(orderId, status) {
  try {
    const data = await apiFetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });

    const updatedOrder = data.order;
    toast(`Pedido #${updatedOrder.orderNumber} atualizado para ${orderStatusLabel(updatedOrder.status)}.`);

    if (state.lastOrder?.id === updatedOrder.id) {
      state.lastOrder = updatedOrder;
      localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(updatedOrder));
    }

    state.myOrders = (state.myOrders || []).map(order => order.id === updatedOrder.id ? updatedOrder : order);
    state.adminData.orders = (state.adminData.orders || []).map(order => order.id === updatedOrder.id ? updatedOrder : order);

    await loadAdminDataFromApi(true);
    await loadMyOrdersFromApi();
    renderTimeline();
    renderMyOrders();
    renderClientArea();
  } catch (error) {
    toast(error.message || 'Não foi possível atualizar o status.');
  }
}

async function advanceTrackedOrderStatus() {
  if (!state.lastOrder?.id) {
    state.trackingStep = (state.trackingStep + 1) % 4;
    renderTimeline();
    toast('Status visual atualizado.');
    return;
  }

  if (!isAdminUser()) {
    toast('Somente owner/admin pode alterar o status real do pedido.');
    return;
  }

  if (['DELIVERED', 'CANCELED'].includes(state.lastOrder.status)) {
    toast(`Pedido #${state.lastOrder.orderNumber} já está ${orderStatusLabel(state.lastOrder.status).toLowerCase()}.`);
    return;
  }

  await updateOrderStatus(state.lastOrder.id, nextOrderStatus(state.lastOrder.status));
}

function renderAdminShell(content) {
  $('#adminContent').innerHTML = content;
}

function renderAdminLoading() {
  renderAdminShell(`
    <div class="admin-lock">
      <strong>Carregando central real</strong>
      <p>Buscando pedidos, produtos, cupons, clientes e relatórios diretamente da API.</p>
    </div>`);
}

function renderAdminError(message) {
  renderAdminShell(`
    <div class="admin-lock warning">
      <strong>Não foi possível sincronizar o admin</strong>
      <p>${message}</p>
      <button class="primary-btn" data-refresh-admin="true">Tentar novamente</button>
    </div>`);
}

function renderAdminResumo() {
  const data = state.adminData;
  const summary = data.summary || {};
  const revenue = Number(summary.revenue || 0);
  const ordersCount = Number(summary.orders || 0);
  const avgTicket = Number(summary.averageTicket || 0);
  const openOrders = Number(summary.openOrders || 0);
  const deliveredRevenue = Number(summary.deliveredRevenue || 0);
  const maxDaily = Math.max(...(data.dailyRevenue || []).map(day => Number(day.revenue || 0)), 1);
  renderAdminShell(`
    <div class="admin-header-row">
      <div><strong>Central real conectada</strong><span>Dados sincronizados com PostgreSQL, Prisma e API Express.</span></div>
      <button class="secondary-btn" data-refresh-admin="true">Atualizar dados</button>
    </div>
    <div class="admin-stats">
      <article><strong>${money(revenue)}</strong><span>Receita sincronizada</span></article>
      <article><strong>${ordersCount}</strong><span>Pedidos no banco</span></article>
      <article><strong>${money(avgTicket)}</strong><span>Ticket médio</span></article>
      <article><strong>${openOrders}</strong><span>Pedidos em andamento</span></article>
      <article><strong>${money(deliveredRevenue)}</strong><span>Receita entregue</span></article>
      <article><strong>${summary.activeProducts || 0}</strong><span>Produtos ativos</span></article>
    </div>
    <div class="admin-dashboard-grid">
      <div class="admin-table">
        <div class="mini-section-title"><strong>Pedidos por status</strong><span>Operação atual</span></div>
        ${(data.byStatus || []).map(item => `<div class="metric-row"><span>${item.label}</span><strong>${item.count}</strong></div>`).join('') || '<p class="muted">Sem pedidos para analisar.</p>'}
      </div>
      <div class="admin-table">
        <div class="mini-section-title"><strong>Receita diária</strong><span>Últimos dias com movimento</span></div>
        <div class="chart-list">${(data.dailyRevenue || []).map(day => `<div class="chart-row"><span>${day.label}</span><div><i style="width:${barWidth(day.revenue, maxDaily)}%"></i></div><strong>${money(Number(day.revenue || 0))}</strong></div>`).join('') || '<p class="muted">Nenhum movimento registrado.</p>'}</div>
      </div>
    </div>
    <div class="admin-table">
      <table>
        <thead><tr><th>Pedido recente</th><th>Cliente</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>${data.orders.slice(0, 6).map(order => `<tr><td>#${order.orderNumber}<small>${serializeDate(order.createdAt)}</small></td><td>${order.customerName}</td><td>${money(Number(order.total || 0))}</td><td><span class="status-pill">${orderStatusLabel(order.status)}</span></td></tr>`).join('') || '<tr><td colspan="4">Nenhum pedido criado ainda.</td></tr>'}</tbody>
      </table>
    </div>
    <div class="admin-table">
      <table>
        <thead><tr><th>Estoque crítico</th><th>Categoria</th><th>Quantidade</th></tr></thead>
        <tbody>${data.lowStock.slice(0, 5).map(item => `<tr><td>${item.name}</td><td>${item.category}</td><td>${item.stock}</td></tr>`).join('') || '<tr><td colspan="3">Nenhum item em estoque crítico.</td></tr>'}</tbody>
      </table>
    </div>`);
}

function renderAdminPedidos() {
  const orders = filterOrdersForAdmin(state.adminData.orders || []);
  const allOrders = state.adminData.orders || [];
  const totalFiltered = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  renderAdminShell(`
    <div class="admin-header-row">
      <div><strong>Pedidos reais avançados</strong><span>Filtre, busque, acompanhe receita e atualize status dos pedidos criados pelo checkout.</span></div>
      <button class="secondary-btn" data-refresh-admin="true">Atualizar</button>
    </div>
    <div class="admin-filter-bar">
      <label>Status
        <select data-admin-filter="orderStatus">
          <option value="ALL" ${adminFilterValue('orderStatus') === 'ALL' ? 'selected' : ''}>Todos</option>
          ${ORDER_STATUS_OPTIONS.map(([value, label]) => `<option value="${value}" ${adminFilterValue('orderStatus') === value ? 'selected' : ''}>${label}</option>`).join('')}
        </select>
      </label>
      <label>Buscar pedido, cliente ou item
        <input data-admin-filter="orderSearch" value="${adminFilterValue('orderSearch')}" placeholder="Ex.: #13, cliente, chocolate...">
      </label>
      <div class="filter-kpis"><strong>${orders.length}/${allOrders.length}</strong><span>pedidos exibidos</span></div>
      <div class="filter-kpis"><strong>${money(totalFiltered)}</strong><span>receita filtrada</span></div>
    </div>
    <div class="admin-table admin-orders-real">
      <table>
        <thead><tr><th>Pedido</th><th>Cliente</th><th>Itens</th><th>Total</th><th>Status</th><th>Ações</th></tr></thead>
        <tbody>${orders.map(order => `
          <tr>
            <td><strong>#${order.orderNumber}</strong><small>${serializeDate(order.createdAt)}</small></td>
            <td>${order.customerName}<small>${order.customerEmail || 'Sem e-mail'} • ${order.customerPhone || 'sem telefone'}</small></td>
            <td>${(order.items || []).map(item => `${item.quantity}x ${item.name}`).join('<br>') || '—'}<small>${order.address || ''}</small></td>
            <td>${money(Number(order.total || 0))}<small>Desc. ${money(Number(order.discount || 0))}</small></td>
            <td><span class="status-pill">${orderStatusLabel(order.status)}</span></td>
            <td><div class="status-actions">${statusOptions(order)}</div></td>
          </tr>`).join('') || '<tr><td colspan="6">Nenhum pedido encontrado com os filtros atuais.</td></tr>'}</tbody>
      </table>
    </div>`);
}


function categoryOptions(selectedId) {
  const categories = state.adminData.categories || [];
  return categories.map(category => `<option value="${category.id}" ${category.id === selectedId ? 'selected' : ''}>${category.name}</option>`).join('');
}

function imageOptions(selectedImage) {
  return visualLibrary.map(([file, use]) => `<option value="${file}" ${file === selectedImage ? 'selected' : ''}>${file} — ${use}</option>`).join('');
}

function productForm(product = {}) {
  const isEditing = Boolean(product.id);
  return `
    <form class="admin-form" data-product-form="${product.id || 'new'}">
      <h4>${isEditing ? 'Editar produto' : 'Criar novo produto'}</h4>
      <label>Nome<input name="name" value="${product.name || ''}" required></label>
      <label>Slug<input name="slug" value="${product.slug || ''}" required></label>
      <label>Preço<input name="price" type="number" step="0.01" min="0" value="${product.price ?? ''}" required></label>
      <label>Estoque<input name="stock" type="number" min="0" value="${product.stock ?? 20}" required></label>
      <label>Categoria<select name="categoryId" required>${categoryOptions(product.categoryId)}</select></label>
      <label>Imagem<select name="image" required>${imageOptions(product.image || '02_acai_de_luxo_a_luz_da_lua')}</select></label>
      <label>Tag<input name="tag" value="${product.tag || ''}" placeholder="Mais pedido, Premium..."></label>
      <label class="checkline"><input name="featured" type="checkbox" ${product.featured ? 'checked' : ''}> Destaque</label>
      <label class="checkline"><input name="active" type="checkbox" ${product.active === false ? '' : 'checked'}> Ativo</label>
      <label class="full">Descrição<textarea name="description" required>${product.desc || product.description || ''}</textarea></label>
      <div class="form-actions"><button class="primary-btn" type="submit">${isEditing ? 'Salvar produto' : 'Criar produto'}</button>${isEditing ? `<button class="secondary-btn" type="button" data-cancel-product-edit="true">Cancelar</button>` : ''}</div>
    </form>`;
}

function couponForm(coupon = {}) {
  const isEditing = Boolean(coupon.id);
  return `
    <form class="admin-form compact" data-coupon-form="${coupon.id || 'new'}">
      <h4>${isEditing ? 'Editar cupom' : 'Criar novo cupom'}</h4>
      <label>Código<input name="code" value="${coupon.code || ''}" required></label>
      <label>Desconto %<input name="percentage" type="number" min="0" max="100" value="${coupon.percentage ?? 10}" required></label>
      <label class="checkline"><input name="active" type="checkbox" ${coupon.active === false ? '' : 'checked'}> Ativo</label>
      <label>Início<input name="startsAt" type="date" value="${coupon.startsAt ? String(coupon.startsAt).slice(0,10) : ''}"></label>
      <label>Expira<input name="expiresAt" type="date" value="${coupon.expiresAt ? String(coupon.expiresAt).slice(0,10) : ''}"></label>
      <label class="full">Descrição<input name="description" value="${coupon.description || ''}" placeholder="Campanha, boas-vindas..."></label>
      <div class="form-actions"><button class="primary-btn" type="submit">${isEditing ? 'Salvar cupom' : 'Criar cupom'}</button>${isEditing ? `<button class="secondary-btn" type="button" data-cancel-coupon-edit="true">Cancelar</button>` : ''}</div>
    </form>`;
}

async function submitProductForm(form) {
  const submitButton = form.querySelector('button[type="submit"]');
  const id = form.dataset.productForm;
  const payload = Object.fromEntries(new FormData(form).entries());
  payload.price = Number(payload.price);
  payload.stock = Number(payload.stock);
  payload.featured = form.elements.featured.checked;
  payload.active = form.elements.active.checked;
  setButtonBusy(submitButton, true, id === 'new' ? 'Criando...' : 'Salvando...');
  try {
    await apiFetch(id === 'new' ? '/api/products' : `/api/products/${id}`, {
      method: id === 'new' ? 'POST' : 'PATCH',
      body: JSON.stringify(payload)
    });
    toast(id === 'new' ? 'Produto criado com sucesso.' : 'Produto atualizado com sucesso.');
    state.editingProductId = null;
    await loadAdminDataFromApi(true);
    await loadProductsFromApi();
    renderCategories();
    renderProducts();
  } catch (error) {
    toast(error.message || 'Não foi possível salvar o produto.');
  } finally {
    setButtonBusy(submitButton, false);
  }
}

async function submitCouponForm(form) {
  const submitButton = form.querySelector('button[type="submit"]');
  const id = form.dataset.couponForm;
  const payload = Object.fromEntries(new FormData(form).entries());
  payload.percentage = Number(payload.percentage);
  payload.active = form.elements.active.checked;
  setButtonBusy(submitButton, true, id === 'new' ? 'Criando...' : 'Salvando...');
  try {
    await apiFetch(id === 'new' ? '/api/coupons' : `/api/coupons/${id}`, {
      method: id === 'new' ? 'POST' : 'PATCH',
      body: JSON.stringify(payload)
    });
    toast(id === 'new' ? 'Cupom criado com sucesso.' : 'Cupom atualizado com sucesso.');
    state.editingCouponId = null;
    await loadAdminDataFromApi(true);
  } catch (error) {
    toast(error.message || 'Não foi possível salvar o cupom.');
  } finally {
    setButtonBusy(submitButton, false);
  }
}

async function updateProductPatch(productId, payload, successMessage) {
  try {
    await apiFetch(`/api/products/${productId}`, { method: 'PATCH', body: JSON.stringify(payload) });
    toast(successMessage || 'Produto atualizado.');
    await loadAdminDataFromApi(true);
    await loadProductsFromApi();
    renderCategories();
    renderProducts();
  } catch (error) {
    toast(error.message || 'Não foi possível atualizar produto.');
  }
}

async function updateProductStock(productId, stock) {
  try {
    await apiFetch(`/api/products/${productId}/stock`, { method: 'PATCH', body: JSON.stringify({ stock }) });
    toast('Estoque atualizado.');
    await loadAdminDataFromApi(true);
    await loadProductsFromApi();
    renderProducts();
  } catch (error) {
    toast(error.message || 'Não foi possível atualizar estoque.');
  }
}

async function updateCouponPatch(couponId, payload, successMessage) {
  try {
    await apiFetch(`/api/coupons/${couponId}`, { method: 'PATCH', body: JSON.stringify(payload) });
    toast(successMessage || 'Cupom atualizado.');
    await loadAdminDataFromApi(true);
  } catch (error) {
    toast(error.message || 'Não foi possível atualizar cupom.');
  }
}

function renderAdminProdutos() {
  const adminProductsRaw = state.adminData.products?.length ? state.adminData.products : products;
  const adminProducts = filterProductsForAdmin(adminProductsRaw);
  const editing = adminProductsRaw.find(product => product.id === state.editingProductId);
  renderAdminShell(`
    <div class="admin-header-row">
      <div><strong>Produtos com CRUD real avançado</strong><span>Crie, edite, filtre, ative/desative, altere imagem, preço, categoria, destaque e estoque.</span></div>
      <button class="secondary-btn" data-refresh-admin="true">Atualizar</button>
    </div>
    <div class="admin-filter-bar">
      <label>Status
        <select data-admin-filter="productStatus">
          <option value="ALL" ${adminFilterValue('productStatus') === 'ALL' ? 'selected' : ''}>Todos</option>
          <option value="ACTIVE" ${adminFilterValue('productStatus') === 'ACTIVE' ? 'selected' : ''}>Ativos</option>
          <option value="INACTIVE" ${adminFilterValue('productStatus') === 'INACTIVE' ? 'selected' : ''}>Inativos</option>
          <option value="LOW_STOCK" ${adminFilterValue('productStatus') === 'LOW_STOCK' ? 'selected' : ''}>Estoque baixo</option>
          <option value="FEATURED" ${adminFilterValue('productStatus') === 'FEATURED' ? 'selected' : ''}>Destaques</option>
        </select>
      </label>
      <label>Buscar produto
        <input data-admin-filter="productSearch" value="${adminFilterValue('productSearch')}" placeholder="Nome, categoria, tag...">
      </label>
      <div class="filter-kpis"><strong>${adminProducts.length}/${adminProductsRaw.length}</strong><span>produtos exibidos</span></div>
    </div>
    <div class="admin-crud-grid">
      ${productForm(editing || {})}
      <div class="admin-products">
        ${adminProducts.map(product => `
          <article class="admin-product ${Number(product.stock || 0) <= 8 ? 'stock-critical' : ''}">
            <img src="${img(product.image)}" alt="${product.name}">
            <strong>${product.name}</strong>
            <span>${product.category} • ${money(Number(product.price || 0))}</span>
            <small>Estoque: ${product.stock ?? '—'} • ${product.active === false ? 'Inativo' : 'Ativo'} • ${product.featured ? 'Destaque' : 'Normal'}</small>
            <div class="mini-actions">
              <button data-edit-product="${product.id}">Editar</button>
              <button data-toggle-product="${product.id}" data-active="${product.active === false ? 'true' : 'false'}">${product.active === false ? 'Ativar' : 'Desativar'}</button>
              <button data-toggle-featured="${product.id}" data-featured="${product.featured ? 'false' : 'true'}">${product.featured ? 'Remover destaque' : 'Destacar'}</button>
            </div>
          </article>`).join('') || '<div class="empty-state"><strong>Nenhum produto encontrado</strong><span>Ajuste os filtros ou crie um novo produto.</span></div>'}
      </div>
    </div>`);
}

function renderAdminEstoque() {
  const adminProducts = state.adminData.products || [];
  renderAdminShell(`
    <div class="admin-header-row"><div><strong>Estoque operacional editável</strong><span>Edição rápida de quantidade, alertas reais e status operacional por produto.</span></div><button class="secondary-btn" data-refresh-admin="true">Atualizar</button></div>
    <div class="admin-table">
      <table>
        <thead><tr><th>Produto</th><th>Categoria</th><th>Estoque</th><th>Status</th><th>Edição rápida</th></tr></thead>
        <tbody>${adminProducts.map(product => {
          const stock = Number(product.stock || 0);
          const status = stock <= 8 ? 'Repor agora' : stock <= 20 ? 'Atenção' : 'OK';
          return `<tr>
            <td>${product.name}<small>${product.active === false ? 'Produto inativo no cardápio' : 'Produto ativo no cardápio'}</small></td>
            <td>${product.category}</td>
            <td><strong>${stock}</strong></td>
            <td><span class="status-pill ${stock <= 8 ? 'danger' : stock <= 20 ? 'warning-pill' : ''}">${status}</span></td>
            <td><div class="stock-actions"><button data-stock-delta="-5" data-stock-product="${product.id}">-5</button><button data-stock-delta="5" data-stock-product="${product.id}">+5</button><input type="number" min="0" value="${stock}" data-stock-input="${product.id}"><button data-stock-save="${product.id}">Salvar</button></div></td>
          </tr>`;
        }).join('') || '<tr><td colspan="5">Produtos não carregados.</td></tr>'}</tbody>
      </table>
    </div>`);
}

function renderAdminCupons() {
  const coupons = state.adminData.coupons || [];
  const editing = coupons.find(coupon => coupon.id === state.editingCouponId);
  renderAdminShell(`
    <div class="admin-header-row"><div><strong>Cupons com CRUD real</strong><span>Crie campanhas, altere percentuais, ative/desative cupons e defina períodos.</span></div><button class="secondary-btn" data-refresh-admin="true">Atualizar</button></div>
    <div class="admin-crud-grid coupons-crud">
      ${couponForm(editing || {})}
      <div class="admin-table">
        <table>
          <thead><tr><th>Código</th><th>Descrição</th><th>Desconto</th><th>Validade</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>${coupons.map(coupon => `<tr><td><strong>${coupon.code}</strong></td><td>${coupon.description || '—'}</td><td>${Number(coupon.percentage)}%</td><td>${coupon.expiresAt ? serializeDate(coupon.expiresAt) : 'Sem expiração'}</td><td><span class="status-pill ${coupon.active ? '' : 'danger'}">${coupon.active ? 'Ativo' : 'Inativo'}</span></td><td><div class="mini-actions row-actions"><button data-edit-coupon="${coupon.id}">Editar</button><button data-toggle-coupon="${coupon.id}" data-active="${coupon.active ? 'false' : 'true'}">${coupon.active ? 'Desativar' : 'Ativar'}</button></div></td></tr>`).join('') || '<tr><td colspan="6">Nenhum cupom cadastrado.</td></tr>'}</tbody>
        </table>
      </div>
    </div>`);
}

function renderAdminClientes() {
  const customers = filterCustomersForAdmin(state.adminData.customers || []);
  const totalOrders = customers.reduce((sum, customer) => sum + Number(customer._count?.orders || 0), 0);
  renderAdminShell(`
    <div class="admin-header-row"><div><strong>Clientes reais avançados</strong><span>Usuários CUSTOMER cadastrados, busca rápida e vínculo com pedidos.</span></div><button class="secondary-btn" data-refresh-admin="true">Atualizar</button></div>
    <div class="admin-filter-bar">
      <label>Buscar cliente
        <input data-admin-filter="customerSearch" value="${adminFilterValue('customerSearch')}" placeholder="Nome, e-mail, telefone...">
      </label>
      <div class="filter-kpis"><strong>${customers.length}</strong><span>clientes exibidos</span></div>
      <div class="filter-kpis"><strong>${totalOrders}</strong><span>pedidos vinculados</span></div>
    </div>
    <div class="admin-table">
      <table>
        <thead><tr><th>Cliente</th><th>E-mail</th><th>Telefone</th><th>Endereço</th><th>Pedidos</th><th>Status</th></tr></thead>
        <tbody>${customers.map(customer => `<tr><td>${customer.name}</td><td>${customer.email}</td><td>${customer.phone || '—'}</td><td>${customer.address || '—'}</td><td>${customer._count?.orders || 0}</td><td><span class="status-pill">${customer.active ? 'Ativo' : 'Inativo'}</span></td></tr>`).join('') || '<tr><td colspan="6">Nenhum cliente encontrado.</td></tr>'}</tbody>
      </table>
    </div>`);
}

function renderAdminRelatorios() {
  const data = state.adminData;
  const summary = data.summary || {};
  const maxProductQty = Math.max(...(data.topProducts || []).map(item => Number(item.quantity || 0)), 1);
  const maxCouponUses = Math.max(...(data.couponUsage || []).map(item => Number(item.uses || 0)), 1);
  const maxDaily = Math.max(...(data.dailyRevenue || []).map(item => Number(item.revenue || 0)), 1);
  renderAdminShell(`
    <div class="admin-header-row"><div><strong>Relatórios profissionais</strong><span>Indicadores de vendas, operação, produtos, cupons, estoque e auditoria.</span></div><button class="secondary-btn" data-refresh-admin="true">Atualizar</button></div>
    <div class="admin-stats extended">
      <article><strong>${money(Number(summary.revenue || 0))}</strong><span>Receita total</span></article>
      <article><strong>${money(Number(summary.deliveredRevenue || 0))}</strong><span>Receita entregue</span></article>
      <article><strong>${summary.orders || 0}</strong><span>Pedidos analisados</span></article>
      <article><strong>${money(Number(summary.averageTicket || 0))}</strong><span>Ticket médio</span></article>
      <article><strong>${summary.customers || 0}</strong><span>Clientes</span></article>
      <article><strong>${summary.openOrders || 0}</strong><span>Pedidos abertos</span></article>
      <article><strong>${summary.lowStockCount || 0}</strong><span>Estoque crítico</span></article>
      <article><strong>${summary.activeCoupons || 0}</strong><span>Cupons ativos</span></article>
    </div>
    <div class="admin-dashboard-grid">
      <div class="admin-table">
        <div class="mini-section-title"><strong>Produtos mais vendidos</strong><span>Quantidade vendida por item</span></div>
        <div class="chart-list">${(data.topProducts || []).map(item => `<div class="chart-row"><span>${item.name}</span><div><i style="width:${barWidth(item.quantity, maxProductQty)}%"></i></div><strong>${item.quantity}x</strong></div>`).join('') || '<p class="muted">Sem produtos vendidos ainda.</p>'}</div>
      </div>
      <div class="admin-table">
        <div class="mini-section-title"><strong>Uso de cupons</strong><span>Campanhas que geraram pedidos</span></div>
        <div class="chart-list">${(data.couponUsage || []).map(item => `<div class="chart-row"><span>${item.code}</span><div><i style="width:${barWidth(item.uses, maxCouponUses)}%"></i></div><strong>${item.uses} uso(s)</strong></div>`).join('') || '<p class="muted">Nenhum cupom usado ainda.</p>'}</div>
      </div>
      <div class="admin-table">
        <div class="mini-section-title"><strong>Receita diária</strong><span>Movimento recente</span></div>
        <div class="chart-list">${(data.dailyRevenue || []).map(item => `<div class="chart-row"><span>${item.label}</span><div><i style="width:${barWidth(item.revenue, maxDaily)}%"></i></div><strong>${money(Number(item.revenue || 0))}</strong></div>`).join('') || '<p class="muted">Sem histórico de receita.</p>'}</div>
      </div>
      <div class="admin-table">
        <div class="mini-section-title"><strong>Pedidos por status</strong><span>Distribuição operacional</span></div>
        ${(data.byStatus || []).map(item => `<div class="metric-row"><span>${item.label}</span><strong>${item.count}</strong></div>`).join('') || '<p class="muted">Sem pedidos.</p>'}
      </div>
    </div>
    <div class="admin-table">
      <table>
        <thead><tr><th>Auditoria recente</th><th>Entidade</th><th>Usuário</th></tr></thead>
        <tbody>${(data.recentAudit || []).map(log => `<tr><td>${log.action}<small>${serializeDate(log.createdAt)}</small></td><td>${log.entity || '—'}</td><td>${log.user?.name || log.user?.email || 'Sistema'}</td></tr>`).join('') || '<tr><td colspan="3">Nenhuma auditoria registrada ainda.</td></tr>'}</tbody>
      </table>
    </div>`);
}

function renderAdminVisual() {
  renderAdminShell(`
    <div class="admin-table">
      <table>
        <thead><tr><th>Categoria</th><th>Quantidade</th><th>Uso</th></tr></thead>
        <tbody>
          <tr><td>Hero/Home</td><td>5</td><td>Topo, banners e impacto inicial.</td></tr>
          <tr><td>Cardápio</td><td>13</td><td>Produtos, bowls, copos e sobremesas.</td></tr>
          <tr><td>Combos</td><td>5</td><td>Ofertas e campanhas.</td></tr>
          <tr><td>Ingredientes</td><td>2</td><td>Monte seu açaí e toppings.</td></tr>
          <tr><td>Institucional/Delivery</td><td>3</td><td>Branding, experiência e checkout.</td></tr>
        </tbody>
      </table>
    </div>`);
}

function renderAdmin() {
  const tabs = ['Resumo', 'Pedidos', 'Produtos', 'Estoque', 'Cupons', 'Clientes', 'Relatórios', 'Visual'];
  $('#adminMenu').innerHTML = tabs.map(tab => `<button class="${state.adminTab === tab ? 'active' : ''}" data-admin-tab="${tab}">${tab}</button>`).join('');

  if (!state.auth.user) {
    renderAdminShell(`
      <div class="admin-lock">
        <strong>Admin aguardando login real</strong>
        <p>Entre com <b>owner@acailunar.dev</b> e senha <b>123456</b> para liberar a central administrativa conectada ao JWT.</p>
        <button class="primary-btn" data-open-auth data-admin-login="true">Entrar como owner</button>
      </div>`);
    return;
  }

  if (!isAdminUser()) {
    renderAdminShell(`
      <div class="admin-lock">
        <strong>Conta cliente conectada</strong>
        <p>${state.auth.user.name}, sua sessão está funcionando. O painel administrativo fica disponível apenas para OWNER/ADMIN.</p>
        <button class="secondary-btn" data-logout="true">Sair da conta cliente</button>
      </div>`);
    return;
  }

  if (!state.adminData) state.adminData = emptyAdminData();
  if (state.adminData.loading) return renderAdminLoading();
  if (state.adminData.error) return renderAdminError(state.adminData.error);
  if (!state.adminData.loaded) {
    loadAdminDataFromApi();
    return renderAdminLoading();
  }

  if (state.adminTab === 'Resumo') return renderAdminResumo();
  if (state.adminTab === 'Pedidos') return renderAdminPedidos();
  if (state.adminTab === 'Produtos') return renderAdminProdutos();
  if (state.adminTab === 'Estoque') return renderAdminEstoque();
  if (state.adminTab === 'Cupons') return renderAdminCupons();
  if (state.adminTab === 'Clientes') return renderAdminClientes();
  if (state.adminTab === 'Relatórios') return renderAdminRelatorios();
  if (state.adminTab === 'Visual') return renderAdminVisual();
}

function bindEvents() {
  document.addEventListener('click', async (event) => {
    const categoryButton = event.target.closest('[data-category]');
    if (categoryButton) {
      state.category = categoryButton.dataset.category;
      renderCategories();
      renderProducts();
    }

    const addButton = event.target.closest('[data-add-product]');
    if (addButton) {
      // Produtos locais usam ID numérico, mas produtos vindos da API/Prisma usam ID em string/UUID.
      // Por isso a comparação precisa ser por String(), sem converter com Number().
      const product = products.find(item => String(item.id) === String(addButton.dataset.addProduct));
      if (!product) {
        console.warn('Produto não encontrado para adicionar ao carrinho:', addButton.dataset.addProduct);
        toast('Não foi possível adicionar este produto. Atualize a página e tente novamente.');
        return;
      }
      addToCart(product);
    }

    if (event.target.closest('[data-add-featured]')) addToCart(products[0]);

    const favoriteButton = event.target.closest('[data-favorite]');
    if (favoriteButton) {
      favoriteButton.classList.toggle('active');
      favoriteButton.textContent = favoriteButton.classList.contains('active') ? '♥' : '♡';
      toast(favoriteButton.classList.contains('active') ? 'Favorito salvo no preview.' : 'Favorito removido.');
    }

    const removeButton = event.target.closest('[data-remove-item]');
    if (removeButton) {
      state.cart = state.cart.filter(item => String(item.id) !== String(removeButton.dataset.removeItem));
      renderCart();
      toast('Item removido.');
    }

    const qtyButton = event.target.closest('[data-change-qty]');
    if (qtyButton) {
      const id = String(qtyButton.dataset.changeQty);
      const delta = Number(qtyButton.dataset.delta);
      const item = state.cart.find(product => String(product.id) === id);
      if (item) item.qty = Math.max(1, item.qty + delta);
      renderCart();
    }

    const builderButton = event.target.closest('[data-builder-type]');
    if (builderButton) {
      const type = builderButton.dataset.builderType;
      const label = builderButton.dataset.builderLabel;
      const option = builder[type].find(item => item.label === label);
      if (type === 'addons') {
        const exists = state.builder.addons.some(item => item.label === label);
        state.builder.addons = exists ? state.builder.addons.filter(item => item.label !== label) : [...state.builder.addons, option];
      } else {
        state.builder[type] = option;
      }
      renderBuilder();
    }


    const clientButton = event.target.closest('[data-client-tab]');
    if (clientButton) {
      state.clientTab = clientButton.dataset.clientTab;
      renderClientArea();
    }

    const repeatButton = event.target.closest('[data-repeat-order]');
    if (repeatButton) repeatOrder(repeatButton.dataset.repeatOrder);

    const trackButton = event.target.closest('[data-track-order]');
    if (trackButton) trackClientOrder(trackButton.dataset.trackOrder);

    const useCouponButton = event.target.closest('[data-use-coupon]');
    if (useCouponButton) {
      $('#couponInput').value = useCouponButton.dataset.useCoupon;
      $('#cartDrawer').classList.add('open');
      $('#overlay').classList.add('open');
      toast(`Cupom ${useCouponButton.dataset.useCoupon} pronto para aplicar.`);
    }

    const fillCheckoutButton = event.target.closest('[data-fill-checkout-from-profile]');
    if (fillCheckoutButton) fillCheckoutFromProfile();

    const adminButton = event.target.closest('[data-admin-tab]');
    if (adminButton) {
      state.adminTab = adminButton.dataset.adminTab;
      renderAdmin();
      if (isAdminUser()) loadAdminDataFromApi();
    }

    const refreshAdminButton = event.target.closest('[data-refresh-admin]');
    if (refreshAdminButton) {
      withButtonBusy(refreshAdminButton, () => loadAdminDataFromApi(true), 'Atualizando...');
    }

    const editProductButton = event.target.closest('[data-edit-product]');
    if (editProductButton) {
      state.editingProductId = editProductButton.dataset.editProduct;
      renderAdmin();
    }

    const cancelProductEdit = event.target.closest('[data-cancel-product-edit]');
    if (cancelProductEdit) {
      state.editingProductId = null;
      renderAdmin();
    }

    const toggleProductButton = event.target.closest('[data-toggle-product]');
    if (toggleProductButton) {
      const willActivate = toggleProductButton.dataset.active === 'true';
      if (!willActivate && !(await confirmAction('Desativar este produto? Ele deixará de aparecer no cardápio público.', { title: 'Desativar produto', confirmText: 'Desativar', tone: 'danger' }))) return;
      withButtonBusy(toggleProductButton, () => updateProductPatch(toggleProductButton.dataset.toggleProduct, { active: willActivate }, willActivate ? 'Produto ativado.' : 'Produto desativado.'), willActivate ? 'Ativando...' : 'Desativando...');
    }

    const toggleFeaturedButton = event.target.closest('[data-toggle-featured]');
    if (toggleFeaturedButton) {
      const willFeature = toggleFeaturedButton.dataset.featured === 'true';
      withButtonBusy(toggleFeaturedButton, () => updateProductPatch(toggleFeaturedButton.dataset.toggleFeatured, { featured: willFeature }, willFeature ? 'Produto marcado como destaque.' : 'Produto removido dos destaques.'), 'Salvando...');
    }

    const stockDeltaButton = event.target.closest('[data-stock-delta]');
    if (stockDeltaButton) {
      const input = document.querySelector(`[data-stock-input="${stockDeltaButton.dataset.stockProduct}"]`);
      const current = Number(input?.value || 0);
      withButtonBusy(stockDeltaButton, () => updateProductStock(stockDeltaButton.dataset.stockProduct, Math.max(0, current + Number(stockDeltaButton.dataset.stockDelta))), 'Salvando...');
    }

    const stockSaveButton = event.target.closest('[data-stock-save]');
    if (stockSaveButton) {
      const input = document.querySelector(`[data-stock-input="${stockSaveButton.dataset.stockSave}"]`);
      withButtonBusy(stockSaveButton, () => updateProductStock(stockSaveButton.dataset.stockSave, Math.max(0, Number(input?.value || 0))), 'Salvando...');
    }

    const editCouponButton = event.target.closest('[data-edit-coupon]');
    if (editCouponButton) {
      state.editingCouponId = editCouponButton.dataset.editCoupon;
      renderAdmin();
    }

    const cancelCouponEdit = event.target.closest('[data-cancel-coupon-edit]');
    if (cancelCouponEdit) {
      state.editingCouponId = null;
      renderAdmin();
    }

    const toggleCouponButton = event.target.closest('[data-toggle-coupon]');
    if (toggleCouponButton) {
      const willActivate = toggleCouponButton.dataset.active === 'true';
      if (!willActivate && !(await confirmAction('Desativar este cupom? Ele deixará de funcionar no carrinho.', { title: 'Desativar cupom', confirmText: 'Desativar', tone: 'danger' }))) return;
      withButtonBusy(toggleCouponButton, () => updateCouponPatch(toggleCouponButton.dataset.toggleCoupon, { active: willActivate }, willActivate ? 'Cupom ativado.' : 'Cupom desativado.'), willActivate ? 'Ativando...' : 'Desativando...');
    }

    const statusButton = event.target.closest('[data-order-status]');
    if (statusButton) {
      const statusLabel = orderStatusLabel(statusButton.dataset.orderStatus);
      if (!(await confirmAction(`Alterar este pedido para "${statusLabel}"? O cliente verá essa atualização.`, { title: 'Atualizar status do pedido', confirmText: 'Atualizar', tone: 'info' }))) return;
      withButtonBusy(statusButton, () => updateOrderStatus(statusButton.dataset.orderId, statusButton.dataset.orderStatus), 'Atualizando...');
    }

    const openImage = event.target.closest('[data-open-image]');
    if (openImage) {
      $('#imageModalImg').src = img(openImage.dataset.openImage);
      $('#imageModalTitle').textContent = openImage.dataset.title;
      $('#imageModalUse').textContent = openImage.dataset.use;
      $('#imageModal').showModal();
    }
  });

  document.addEventListener('input', (event) => {
    const adminFilter = event.target.closest('[data-admin-filter]');
    if (adminFilter) {
      state.adminFilters[adminFilter.dataset.adminFilter] = adminFilter.value;
      renderAdmin();
    }
  });

  document.addEventListener('change', (event) => {
    const adminFilter = event.target.closest('[data-admin-filter]');
    if (adminFilter) {
      state.adminFilters[adminFilter.dataset.adminFilter] = adminFilter.value;
      renderAdmin();
    }
  });

  document.addEventListener('submit', (event) => {
    const clientProfileForm = event.target.closest('#clientProfileForm');
    if (clientProfileForm) {
      event.preventDefault();
      updateClientProfile(clientProfileForm);
      return;
    }

    const productFormEl = event.target.closest('[data-product-form]');
    if (productFormEl) {
      event.preventDefault();
      submitProductForm(productFormEl);
      return;
    }
    const couponFormEl = event.target.closest('[data-coupon-form]');
    if (couponFormEl) {
      event.preventDefault();
      submitCouponForm(couponFormEl);
    }
  });

  $('#searchInput').addEventListener('input', (event) => {
    state.search = event.target.value;
    renderProducts();
  });

  $('#addCustomBowl').addEventListener('click', addCustomBowl);
  $('#simulateOrder').addEventListener('click', advanceTrackedOrderStatus);

  $$('[data-open-cart]').forEach(button => button.addEventListener('click', () => {
    $('#cartDrawer').classList.add('open');
    $('#overlay').classList.add('open');
  }));

  $$('[data-close-cart], #overlay').forEach(button => button.addEventListener('click', () => {
    $('#cartDrawer').classList.remove('open');
    $('#overlay').classList.remove('open');
  }));

  document.addEventListener('click', async (event) => {
    const authButton = event.target.closest('[data-open-auth]');
    if (authButton) {
      if (state.auth.user || authButton.dataset.logout === 'true') {
        clearSession(true);
        return;
      }
      $('#authModal').showModal();
    }

    const logoutButton = event.target.closest('[data-logout]');
    if (logoutButton && !logoutButton.matches('[data-open-auth]')) clearSession(true);

    const demoButton = event.target.closest('[data-demo-login]');
    if (demoButton) fillDemoCredentials(demoButton.dataset.demoLogin);
  });

  document.addEventListener('click', async (event) => {
    if (event.target.closest('#refreshClientArea') || event.target.closest('#refreshClientOrders')) {
      await loadMyOrdersFromApi();
      renderClientArea();
      toast('Área do cliente atualizada.');
    }
  });

  $$('[data-close-auth]').forEach(button => button.addEventListener('click', () => $('#authModal').close()));
  $$('[data-close-image]').forEach(button => button.addEventListener('click', () => $('#imageModal').close()));
  $('[data-confirm-cancel]').addEventListener('click', () => closeConfirmModal(false));
  $('[data-confirm-accept]').addEventListener('click', () => closeConfirmModal(true));
  $('#confirmModal').addEventListener('cancel', (event) => { event.preventDefault(); closeConfirmModal(false); });
  $('#confirmModal').addEventListener('click', (event) => { if (event.target === $('#confirmModal')) closeConfirmModal(false); });

  $('#mobileMenuBtn').addEventListener('click', () => {
    $('#mainNav').classList.toggle('open');
  });

  $$('#mainNav a').forEach(link => link.addEventListener('click', () => $('#mainNav').classList.remove('open')));

  $('#loginBtn').addEventListener('click', submitLogin);
  $('#registerBtn').addEventListener('click', submitRegister);
  $('#authPassword').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') submitLogin();
  });

  $('#applyCoupon').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    const code = $('#couponInput').value.trim().toUpperCase();
    if (!code) {
      state.coupon = null;
      renderCart();
      toast('Informe um cupom.');
      return;
    }

    setButtonBusy(button, true, 'Aplicando...');
    try {
      const data = await apiFetch('/api/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code })
      });
      state.coupon = data.coupon;
      renderCart();
      toast(`Cupom ${state.coupon.code} aplicado.`);
    } catch (error) {
      state.coupon = null;
      renderCart();
      toast(error.message || 'Cupom inválido.');
    } finally {
      setButtonBusy(button, false);
    }
  });

  $('#clearCartBtn').addEventListener('click', async () => {
    if (state.cart.length && !(await confirmAction('Limpar todos os itens do carrinho?', { title: 'Limpar carrinho', confirmText: 'Limpar', tone: 'warning' }))) return;
    state.cart = [];
    state.coupon = null;
    renderCart();
    toast('Carrinho limpo.');
  });

  $('#checkoutBtn').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    if (!state.cart.length) return toast('Adicione itens ao carrinho.');
    if (!state.auth.user) {
      toast('Entre na sua conta para criar pedido real no banco.');
      $('#authModal').showModal();
      return;
    }
    setButtonBusy(button, true, 'Enviando pedido...');
    try {
      const result = await createOrderFromApi();
      state.lastOrder = result.order;
      localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(result.order));
      toast(result.order?.orderNumber ? `Pedido #${result.order.orderNumber} salvo no PostgreSQL.` : 'Pedido criado na API.');
      state.cart = [];
      state.coupon = null;
      state.trackingStep = stepFromStatus(result.order?.status);
      await loadMyOrdersFromApi();
      if (isAdminUser()) await loadAdminDataFromApi(true);
      renderCart();
      renderTimeline();
      renderAdmin();
      $('#cartDrawer').classList.remove('open');
      $('#overlay').classList.remove('open');
      location.hash = '#tracking';
    } catch (error) {
      console.warn(error);
      toast(error.message || 'Não foi possível criar pedido real.');
    } finally {
      setButtonBusy(button, false);
    }
  });
}

async function init() {
  await syncSessionFromApi();
  await loadProductsFromApi();
  await loadMyOrdersFromApi();
  if (isAdminUser()) await loadAdminDataFromApi(true);
  renderCategories();
  renderProducts();
  renderBuilder();
  renderCart();
  renderTimeline();
  renderClientArea();
  renderGallery();
  renderAdmin();
  bindEvents();
  document.body.classList.add('app-ready');
}

init();
