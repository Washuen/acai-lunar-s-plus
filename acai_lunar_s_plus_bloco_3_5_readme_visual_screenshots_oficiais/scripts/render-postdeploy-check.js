const BASE_URL = (process.env.RENDER_BASE_URL || process.argv[2] || '').replace(/\/$/, '');

if (!BASE_URL) {
  console.error('\n❌ Informe a URL pública do Render.');
  console.error('Exemplo:');
  console.error('node scripts/render-postdeploy-check.js https://acai-lunar-s-plus.onrender.com');
  process.exit(1);
}

async function request(path) {
  const response = await fetch(`${BASE_URL}${path}`);
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (_) {
    data = text;
  }

  if (!response.ok) {
    throw new Error(`${path} -> HTTP ${response.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

async function main() {
  console.log(`\nAçaí Lunar S+ — Pós-deploy check\nURL: ${BASE_URL}\n`);

  const health = await request('/api/health');
  if (!health.ok) throw new Error('/api/health não retornou ok=true.');
  console.log('✅ /api/health ok');
  console.log(`✅ Banco: ${health.database || 'verificado'}`);

  const html = await request('/');
  if (typeof html !== 'string' || !html.includes('Açaí Lunar')) {
    throw new Error('Página inicial não parece carregar o frontend do Açaí Lunar.');
  }
  console.log('✅ Frontend público respondeu');

  const products = await request('/api/products');
  if (!products.products || !Array.isArray(products.products)) {
    throw new Error('/api/products não retornou lista de produtos.');
  }
  console.log(`✅ Produtos públicos: ${products.products.length}`);

  console.log('\n🎉 Pós-deploy básico aprovado.\n');
}

main().catch(error => {
  console.error('\n❌ Pós-deploy check falhou.');
  console.error(error.message);
  process.exit(1);
});
