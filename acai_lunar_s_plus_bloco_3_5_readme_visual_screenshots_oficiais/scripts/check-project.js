const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
const requiredFiles = [
  'package.json',
  '.env.example',
  'README.md',
  'src/server.js',
  'src/lib/prisma.js',
  'src/middleware/auth.js',
  'src/routes/auth.js',
  'src/routes/products.js',
  'src/routes/coupons.js',
  'src/routes/orders.js',
  'src/routes/customers.js',
  'src/routes/settings.js',
  'src/routes/reports.js',
  'prisma/schema.prisma',
  'prisma/seed.js',
  'public/index.html',
  'public/styles.css',
  'public/app.js',
  'public/assets/favicon/favicon-32.png',
  'public/assets/favicon/favicon-192.png'
];

const jsFiles = [
  'src/server.js',
  'src/lib/prisma.js',
  'src/middleware/auth.js',
  'src/routes/auth.js',
  'src/routes/products.js',
  'src/routes/coupons.js',
  'src/routes/orders.js',
  'src/routes/customers.js',
  'src/routes/settings.js',
  'src/routes/reports.js',
  'src/utils/asyncHandler.js',
  'src/utils/validators.js',
  'prisma/seed.js',
  'public/app.js'
];

let failed = false;

function ok(message) {
  console.log(`✅ ${message}`);
}

function fail(message) {
  failed = true;
  console.error(`❌ ${message}`);
}

console.log('\nAçaí Lunar S+ — Verificação estrutural\n');

for (const file of requiredFiles) {
  const full = path.join(root, file);
  if (fs.existsSync(full)) ok(`Arquivo encontrado: ${file}`);
  else fail(`Arquivo ausente: ${file}`);
}

console.log('\nValidando sintaxe JavaScript...\n');

for (const file of jsFiles) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) continue;
  const result = spawnSync(process.execPath, ['--check', full], { encoding: 'utf-8' });
  if (result.status === 0) ok(`node --check: ${file}`);
  else {
    fail(`Erro de sintaxe em ${file}`);
    console.error(result.stderr || result.stdout);
  }
}

console.log('\nChecando package.json...\n');
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'));
  ['dev', 'start', 'db:generate', 'db:push', 'db:seed'].forEach(script => {
    if (pkg.scripts && pkg.scripts[script]) ok(`Script npm disponível: ${script}`);
    else fail(`Script npm ausente: ${script}`);
  });
} catch (error) {
  fail(`package.json inválido: ${error.message}`);
}

if (failed) {
  console.error('\nResultado: verificação estrutural encontrou problemas.\n');
  process.exit(1);
}

console.log('\nResultado: estrutura e sintaxe aprovadas.\n');
