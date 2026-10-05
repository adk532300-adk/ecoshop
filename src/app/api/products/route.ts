import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const featured = searchParams.get('featured');

  const products = await prisma.product.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(featured === 'true' ? { featured: true } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { description: { contains: search } },
              { category: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(products);
}
