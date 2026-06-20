const DEFAULT_URL = 'https://acai-lunar-s-plus.onrender.com';
const BASE_URL = (process.env.PRODUCTION_BASE_URL || process.argv[2] || DEFAULT_URL).replace(/\/$/, '');

function ok(message) { console.log(`✅ ${message}`); }

async function fetchText(path) {
  const response = await fetch(`${BASE_URL}${path}`);
  const text = await response.text();
  if (!response.ok) throw new Error(`${path} -> HTTP ${response.status}: ${text.slice(0, 300)}`);
  return text;
}

async function fetchJson(path) {
  const text = await fetchText(path);
  try { return JSON.parse(text); } catch (_) { throw new Error(`${path} não retornou JSON válido.`); }
}

async function main() {
  console.log(`\nAçaí Lunar S+ — Production Check`);
  console.log(`URL: ${BASE_URL}\n`);

  const health = await fetchJson('/api/health');
  if (!health.ok || health.database !== 'connected') {
    throw new Error(`/api/health inesperado: ${JSON.stringify(health)}`);
  }
  ok('Health check com banco conectado.');

  const html = await fetchText('/');
  const requiredTexts = ['Açaí Lunar', 'Momentos Lunares', 'Por que escolher o Açaí Lunar?', 'Gestão Açaí Lunar'];
  for (const text of requiredTexts) {
    if (!html.includes(text)) throw new Error(`Texto não encontrado no HTML publicado: ${text}`);
    ok(`Texto publicado encontrado: ${text}`);
  }

  const forbiddenTexts = ['Critérios de UX antes do backend', '28 imagens curadas para o UX', 'Admin preview', 'pronto para backend', 'Backend ready'];
  for (const text of forbiddenTexts) {
    if (html.includes(text)) throw new Error(`Texto antigo ainda encontrado no HTML publicado: ${text}`);
    ok(`Texto antigo removido: ${text}`);
  }

  const products = await fetchJson('/api/products');
  if (!Array.isArray(products.products) || products.products.length === 0) throw new Error('/api/products não retornou produtos.');
  ok(`Produtos públicos carregados: ${products.products.length}`);

  console.log('\n🎉 Production check aprovado.\n');
}

main().catch(error => {
  console.error('\n❌ Production check falhou.');
  console.error(error.message);
  console.error('\nConfira se o Render publicou o último commit e tente Clear build cache & deploy se necessário.\n');
  process.exit(1);
});
