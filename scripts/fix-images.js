const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  await prisma.product.update({ where: { slug: 'coconut-shell-bowls' }, data: { imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800&auto=format&fit=crop' } });
  await prisma.product.update({ where: { slug: 'cork-leather-wallet' }, data: { imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop' } });
  await prisma.product.update({ where: { slug: 'wheat-straw-phone-case' }, data: { imageUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&auto=format&fit=crop' } });
  await prisma.product.update({ where: { slug: 'neem-wood-comb' }, data: { imageUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&auto=format&fit=crop' } });
  console.log('Done! All images updated to Unsplash URLs.');
  await prisma.$disconnect();
}

fix().catch(console.error);
