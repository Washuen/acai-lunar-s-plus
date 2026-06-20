const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const requiredFiles = [
  'package.json',
  'render.yaml',
  '.env.example',
  'src/server.js',
  'prisma/schema.prisma',
  'prisma/seed.js',
  'public/index.html',
  'docs/DEPLOY_GUIDE.md',
  'docs/RENDER_DEPLOY_STEP_BY_STEP.md',
  'docs/PRODUCTION_ENV.md'
];

let failed = false;

function ok(message) {
  console.log(`✅ ${message}`);
}

function warn(message) {
  console.warn(`⚠️  ${message}`);
}

function fail(message) {
  failed = true;
  console.error(`❌ ${message}`);
}

console.log('\nAçaí Lunar S+ — Render Deploy Preflight\n');

for (const file of requiredFiles) {
  if (fs.existsSync(path.join(root, file))) ok(`Arquivo encontrado: ${file}`);
  else fail(`Arquivo ausente: ${file}`);
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'));

if (pkg.scripts?.start) ok(`Script start: ${pkg.scripts.start}`);
else fail('Script start ausente no package.json.');

if (pkg.scripts?.db?.includes?.('')) {
  // no-op
}

if (pkg.scripts?.['db:seed']) ok(`Script db:seed: ${pkg.scripts['db:seed']}`);
else fail('Script db:seed ausente no package.json.');

if (pkg.dependencies?.['@prisma/client']) ok('@prisma/client em dependencies.');
else fail('@prisma/client precisa estar em dependencies.');

if (pkg.devDependencies?.prisma || pkg.dependencies?.prisma) ok('prisma disponível para build/db push.');
else fail('prisma não encontrado nas dependências.');

const renderYaml = fs.readFileSync(path.join(root, 'render.yaml'), 'utf-8');

if (renderYaml.includes('healthCheckPath: /api/health')) ok('render.yaml possui healthCheckPath.');
else warn('render.yaml não define healthCheckPath.');

if (renderYaml.includes('npx prisma generate')) ok('render.yaml gera Prisma Client no build.');
else fail('render.yaml precisa executar npx prisma generate no build.');

if (renderYaml.includes('DATABASE_URL') && renderYaml.includes('JWT_SECRET')) ok('render.yaml lista variáveis críticas.');
else fail('render.yaml precisa listar DATABASE_URL e JWT_SECRET.');

if (fs.existsSync(path.join(root, '.env'))) {
  warn('.env existe localmente. Isso é normal localmente, mas não envie para GitHub.');
} else {
  ok('.env não encontrado na pasta atual.');
}

console.log('\nVariáveis necessárias no Render:\n');
console.log('NODE_ENV=production');
console.log('DATABASE_URL=<Internal Database URL do PostgreSQL Render>');
console.log('JWT_SECRET=<segredo forte>');
console.log('JWT_EXPIRES_IN=7d');

if (failed) {
  console.error('\nResultado: existem bloqueios antes do deploy.\n');
  process.exit(1);
}

console.log('\nResultado: projeto preparado para configuração do deploy no Render.\n');
