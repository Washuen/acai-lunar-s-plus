const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const forbidden = [
  '.env',
  'node_modules',
  '.DS_Store',
  'npm-debug.log',
  'yarn-error.log'
];

const required = [
  'README.md',
  '.gitignore',
  '.env.example',
  'package.json',
  'render.yaml',
  'src/server.js',
  'public/index.html',
  'prisma/schema.prisma',
  'prisma/seed.js',
  'docs/ARCHITECTURE.md',
  'docs/BUSINESS_RULES.md',
  'docs/DEPLOY_GUIDE.md',
  'docs/PROJECT_PRESENTATION.md',
  'docs/GITHUB_GUIDE.md',
  'docs/RELEASE_NOTES_v1.0.0.md',
  'CHECKLIST_FINAL_BLOCO_3_0.md'
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

console.log('\nAçaí Lunar S+ — GitHub Preflight\n');

for (const file of required) {
  if (fs.existsSync(path.join(root, file))) ok(`Obrigatório encontrado: ${file}`);
  else fail(`Obrigatório ausente: ${file}`);
}

console.log('\nChecando arquivos que não devem ir ao GitHub...\n');

for (const item of forbidden) {
  if (fs.existsSync(path.join(root, item))) {
    if (item === '.env') fail('Arquivo .env encontrado. Remova antes do git add.');
    else fail(`${item} encontrado. Remova antes do git add.`);
  } else {
    ok(`${item} não encontrado.`);
  }
}

const gitignore = fs.existsSync(path.join(root, '.gitignore'))
  ? fs.readFileSync(path.join(root, '.gitignore'), 'utf-8')
  : '';

['node_modules/', '.env', '*.log'].forEach(rule => {
  if (gitignore.includes(rule)) ok(`.gitignore protege: ${rule}`);
  else warn(`.gitignore talvez não proteja: ${rule}`);
});

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'));
if (pkg.repository?.url?.includes('SEU_USUARIO')) {
  warn('package.json ainda usa placeholder SEU_USUARIO. Atualize depois de criar o repositório.');
} else {
  ok('repository.url configurado.');
}

console.log('\nComandos recomendados:\n');
console.log('git init');
console.log('git add .');
console.log('git commit -m "feat: release Acai Lunar S Plus fullstack system"');
console.log('git branch -M main');
console.log('git remote add origin https://github.com/SEU_USUARIO/acai-lunar-s-plus.git');
console.log('git push -u origin main');

if (failed) {
  console.error('\nResultado: preflight encontrou bloqueios. Corrija antes do GitHub.\n');
  process.exit(1);
}

console.log('\nResultado: projeto pronto para preparação de GitHub.\n');
