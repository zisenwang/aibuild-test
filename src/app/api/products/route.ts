import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { handleApiError } from '@/lib/api/errors';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        sku: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            metrics: true
          }
        }
      },
      orderBy: {
        sku: 'asc'
      }
    });

    console.log(`[PRODUCTS] Returned ${products.length} products`);

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length
    });

  } catch (error) {
    return handleApiError(error, 'PRODUCTS');
  }
}