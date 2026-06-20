const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categories = [
  { name: 'Bowls', description: 'Bowls premium de açaí', position: 1 },
  { name: 'Copos', description: 'Copos e parfaits em camadas', position: 2 },
  { name: 'Bebidas', description: 'Smoothies e bebidas geladas', position: 3 },
  { name: 'Combos', description: 'Combos para compartilhar', position: 4 },
  { name: 'Especiais', description: 'Edições limitadas e premium', position: 5 },
  { name: 'Mini', description: 'Porções delicadas e leves', position: 6 }
];

const products = [
  { name: 'Eclipse Tropical', slug: 'eclipse-tropical', category: 'Bowls', price: 29.9, image: '02_acai_de_luxo_a_luz_da_lua', tag: 'Mais pedido', stock: 42, featured: true, description: 'Açaí premium, morango, banana, kiwi, granola, coco e mel lunar.' },
  { name: 'Lua Cheia Clássico', slug: 'lua-cheia-classico', category: 'Bowls', price: 24.9, image: '17_acai_com_frutas_e_granola', tag: 'Clássico', stock: 55, featured: true, description: 'Açaí cremoso com banana, morango, granola crocante e leite condensado.' },
  { name: 'Aurora Fitness', slug: 'aurora-fitness', category: 'Bowls', price: 31.9, image: '05_tigela_de_smoothie_fitness_com_detalhes', tag: 'Proteico', stock: 24, featured: false, description: 'Base de açaí com pasta de amendoim, banana, granola e toque funcional.' },
  { name: 'Constelação Gourmet', slug: 'constelacao-gourmet', category: 'Bowls', price: 34.9, image: '26_tigela_de_acai_ao_estilo_gourmet', tag: 'Gourmet', stock: 18, featured: true, description: 'Morango, banana, coco, granola premium e calda artesanal.' },
  { name: 'Nebulosa de Chocolate', slug: 'nebulosa-de-chocolate', category: 'Bowls', price: 36.9, image: '24_sob_o_brilho_da_lua_e_frutas', tag: 'Chocolate', stock: 12, featured: false, description: 'Açaí, brownie, chocolate, morango, banana e granola.' },
  { name: 'Lunar Cup Dourado', slug: 'lunar-cup-dourado', category: 'Copos', price: 27.9, image: '27_parfait_noturno_com_toque_dourado', tag: 'Parfait', stock: 32, featured: true, description: 'Copo em camadas com açaí, granola, creme e frutas frescas.' },
  { name: 'Orquídea Roxa', slug: 'orquidea-roxa', category: 'Copos', price: 30.9, image: '25_parfait_elegante_com_flores_e_luzes', tag: 'Premium', stock: 15, featured: false, description: 'Parfait elegante com frutas vermelhas, flores comestíveis e crocância.' },
  { name: 'Smoothie Delícia Roxa', slug: 'smoothie-delicia-roxa', category: 'Bebidas', price: 22.9, image: '15_delicia_roxa_ao_luar', tag: 'Bebida', stock: 28, featured: false, description: 'Smoothie gelado de açaí com textura cremosa e topping crocante.' },
  { name: 'Noite para Dois', slug: 'noite-para-dois', category: 'Combos', price: 54.9, image: '06_noite_de_sabores_e_acai_premium', tag: 'Combo', stock: 20, featured: true, description: 'Dois produtos premium para compartilhar sob a luz da lua.' },
  { name: 'Trio Família Lunar', slug: 'trio-familia-lunar', category: 'Combos', price: 79.9, image: '22_noite_luxuosa_com_delicias_de_acai', tag: 'Família', stock: 11, featured: false, description: 'Combo de bowls e copos para uma experiência completa.' },
  { name: 'Especial Lua de Chocolate', slug: 'especial-lua-de-chocolate', category: 'Especiais', price: 39.9, image: '08_sob_a_lua_sobremesa_de_luxo', tag: 'Limitado', stock: 8, featured: true, description: 'Edição especial com chocolate, creme, morangos e cobertura intensa.' },
  { name: 'Mini Lunar', slug: 'mini-lunar', category: 'Mini', price: 16.9, image: '09_sob_o_luar_sobremesa_tropical_sofisticada', tag: 'Mini', stock: 44, featured: false, description: 'Porção delicada para provar sem perder o visual premium.' }
];

async function main() {
  console.log('Seeding Açaí Lunar database...');

  const password = await bcrypt.hash('123456', 10);
  await prisma.user.upsert({
    where: { email: 'owner@acailunar.dev' },
    update: {},
    create: { name: 'Owner Açaí Lunar', email: 'owner@acailunar.dev', password, role: 'OWNER', phone: '(81) 99999-0000', address: 'Rua Lunar, 100 - Recife, PE' }
  });
  await prisma.user.upsert({
    where: { email: 'cliente@acailunar.dev' },
    update: {},
    create: { name: 'Cliente Lunar', email: 'cliente@acailunar.dev', password, role: 'CUSTOMER', phone: '(81) 98888-0000', address: 'Rua das Estrelas, 42 - Recife, PE' }
  });

  for (const category of categories) {
    await prisma.category.upsert({ where: { name: category.name }, update: category, create: category });
  }
  const savedCategories = await prisma.category.findMany();
  const categoryMap = new Map(savedCategories.map(category => [category.name, category.id]));

  for (const product of products) {
    const { category, ...data } = product;
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: { ...data, categoryId: categoryMap.get(category) },
      create: { ...data, categoryId: categoryMap.get(category) }
    });
  }

  await prisma.coupon.upsert({
    where: { code: 'LUNAR15' },
    update: { percentage: 15, active: true, description: 'Cupom oficial do preview Açaí Lunar.' },
    create: { code: 'LUNAR15', percentage: 15, active: true, description: 'Cupom oficial do preview Açaí Lunar.' }
  });

  const setting = await prisma.storeSetting.findFirst();
  if (!setting) {
    await prisma.storeSetting.create({
      data: {
        storeName: 'Açaí Lunar',
        open: true,
        openingHours: '18:00–00:30',
        deliveryFee: 6.9,
        minimumOrder: 18,
        estimatedTime: '35–50 min',
        whatsapp: '(81) 99999-0000'
      }
    });
  }

  console.log('Seed completed.');
  console.log('Demo owner: owner@acailunar.dev');
  console.log('Demo customer: cliente@acailunar.dev');
  console.log('Password: 123456');
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
