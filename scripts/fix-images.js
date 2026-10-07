const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const updates = [
    { slug: 'bamboo-toothbrush',      imageUrl: '/products/bamboo-toothbrush.jpg' },
    { slug: 'organic-cotton-tote-bag', imageUrl: '/products/organic-cotton-tote-bag.jpg' },
    { slug: 'steel-water-bottle',      imageUrl: '/products/steel-water-bottle.jpg' },
    { slug: 'shampoo-bar',             imageUrl: '/products/shampoo-bar.jpg' },
    { slug: 'beeswax-food-wraps',      imageUrl: '/products/beeswax-food-wraps.jpg' },
    { slug: 'recycled-paper-notebook', imageUrl: '/products/recycled-paper-notebook.jpg' },
    { slug: 'coconut-shell-bowls',     imageUrl: '/products/coconut-bowls.jpg' },
    { slug: 'cork-leather-wallet',     imageUrl: '/products/cork-wallet.jpg' },
    { slug: 'wheat-straw-phone-case',  imageUrl: '/products/wheat-phone-case.jpg' },
    { slug: 'neem-wood-comb',          imageUrl: '/products/neem-comb.jpg' },
  ];

  for (const u of updates) {
    await prisma.product.update({ where: { slug: u.slug }, data: { imageUrl: u.imageUrl } });
    console.log(`✅ Updated: ${u.slug}`);
  }

  console.log('\n🎉 All 10 products updated with AI images!');
  await prisma.$disconnect();
}

fix().catch(console.error);
