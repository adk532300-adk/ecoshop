import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const products = [
  {
    name: 'Eco-Friendly Bamboo Toothbrush',
    slug: 'bamboo-toothbrush',
    price: 299,
    rating: 4.5,
    reviews: 1234,
    ecoScore: 9.2,
    description: 'Biodegradable, Natural Bamboo handle with soft BPA-free bristles. Lasts up to 3 months.',
    category: 'Personal Care',
    material: 'bamboo',
    imageUrl: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    featured: true,
    stock: 200,
  },
  {
    name: 'Organic Cotton Tote Bag',
    slug: 'organic-cotton-tote-bag',
    price: 499,
    rating: 4.8,
    reviews: 856,
    ecoScore: 8.7,
    description: 'Durable, washable, and made from 100% GOTS-certified organic cotton.',
    category: 'Accessories',
    material: 'cotton',
    imageUrl: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    stock: 150,
  },
  {
    name: 'Reusable Steel Water Bottle',
    slug: 'steel-water-bottle',
    price: 799,
    rating: 4.7,
    reviews: 2104,
    ecoScore: 9.0,
    description: 'Keeps drinks cold 24 hrs / hot 12 hrs. Replaces 1,000+ plastic bottles.',
    category: 'Kitchen',
    material: 'reusable steel',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    stock: 120,
  },
  {
    name: 'Eco-Friendly Shampoo Bar',
    slug: 'shampoo-bar',
    price: 249,
    rating: 4.6,
    reviews: 543,
    ecoScore: 8.9,
    description: 'Zero-waste, plastic-free shampoo bar. Equivalent to 2-3 bottles of liquid shampoo.',
    category: 'Personal Care',
    material: 'natural',
    imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    stock: 300,
  },
  {
    name: 'Beeswax Food Wraps',
    slug: 'beeswax-food-wraps',
    price: 349,
    rating: 4.4,
    reviews: 389,
    ecoScore: 8.5,
    description: 'Natural alternative to plastic wrap. Reusable up to 1 year. Washable with cold water.',
    category: 'Kitchen',
    material: 'beeswax cotton',
    imageUrl: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    stock: 180,
  },
  {
    name: 'Recycled Paper Notebook',
    slug: 'recycled-paper-notebook',
    price: 199,
    rating: 4.3,
    reviews: 712,
    ecoScore: 7.8,
    description: '100% post-consumer recycled paper. Soy-based ink. Compostable cover.',
    category: 'Stationery',
    material: 'recycled paper',
    imageUrl: 'https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    stock: 250,
  },
  {
    name: 'Coconut Shell Bowls (Set of 2)',
    slug: 'coconut-shell-bowls',
    price: 499,
    rating: 4.9,
    reviews: 1450,
    ecoScore: 9.5,
    description: 'Upcycled coconut shells. 100% natural, biodegradable, and perfect for smoothie bowls.',
    category: 'Kitchen',
    material: 'coconut shell',
    imageUrl: '/products/coconut-bowls.jpg',
    featured: true,
    stock: 100,
  },
  {
    name: 'Cork Leather Wallet',
    slug: 'cork-leather-wallet',
    price: 799,
    rating: 4.8,
    reviews: 890,
    ecoScore: 9.1,
    description: 'Stylish, vegan, and water-resistant. Made from 100% natural and sustainable cork.',
    category: 'Accessories',
    material: 'cork',
    imageUrl: '/products/cork-wallet.jpg',
    stock: 80,
  },
  {
    name: 'Wheat Straw Phone Case',
    slug: 'wheat-straw-phone-case',
    price: 450,
    rating: 4.6,
    reviews: 560,
    ecoScore: 8.8,
    description: 'Compostable eco-friendly phone case made from wheat straw and plant polymers.',
    category: 'Tech',
    material: 'wheat straw',
    imageUrl: '/products/wheat-phone-case.jpg',
    stock: 120,
  },
  {
    name: 'Neem Wood Comb',
    slug: 'neem-wood-comb',
    price: 150,
    rating: 4.7,
    reviews: 210,
    ecoScore: 9.3,
    description: '100% natural neem wood. Anti-bacterial, promotes healthy scalp, and fully biodegradable.',
    category: 'Personal Care',
    material: 'neem wood',
    imageUrl: '/products/neem-comb.jpg',
    stock: 200,
  },
]

async function main() {
  console.log('🌱 Seeding database...')
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    })
  }
  console.log(`✅ Seeded ${products.length} products.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
