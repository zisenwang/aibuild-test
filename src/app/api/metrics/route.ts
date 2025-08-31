import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getClientIP } from '@/lib/utils';
import { handleApiError } from '@/lib/api/errors';

export async function GET(request: NextRequest) {
  const clientIP = getClientIP(request);
  console.log(`[METRICS] Request from IP: ${clientIP}`);

  try {
    const { searchParams } = new URL(request.url);
    const productIds = searchParams.get('products')?.split(',').filter(Boolean) || [];
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const whereConditions = buildWhereConditions(productIds, startDate, endDate);
    
    const metrics = await fetchMetricsWithProducts(whereConditions);
    
    const chartData = transformForMUICharts(metrics);

    console.log(`[METRICS] Returned ${metrics.length} daily metrics for ${chartData.length} products`);

    return NextResponse.json({
      success: true,
      data: chartData,
      count: metrics.length
    });

  } catch (error) {
    return handleApiError(error, `METRICS - ${clientIP}`);
  }
}

function buildWhereConditions(productIds: string[], startDate: string | null, endDate: string | null) {
  const whereConditions: any = {};
  
  if (productIds.length > 0) {
    whereConditions.productId = { in: productIds };
  }
  
  if (startDate || endDate) {
    whereConditions.date = {};
    if (startDate) whereConditions.date.gte = new Date(startDate);
    if (endDate) whereConditions.date.lte = new Date(endDate);
  }

  return whereConditions;
}

async function fetchMetricsWithProducts(whereConditions: any) {
  return await prisma.dailyMetric.findMany({
    where: whereConditions,
    include: {
      product: {
        select: {
          id: true,
          sku: true,
          name: true
        }
      }
    },
    orderBy: [
      { product: { sku: 'asc' } },
      { date: 'asc' }
    ]
  });
}

function transformForMUICharts(metrics: any[]) {
  if (metrics.length === 0) {
    return [];
  }

  // Group metrics by product
  const productGroups = metrics.reduce((acc, metric) => {
    const productId = metric.product.id;
    if (!acc[productId]) {
      acc[productId] = {
        product: {
          id: productId,
          sku: metric.product.sku,
          name: metric.product.name
        },
        dailyData: []
      };
    }
    acc[productId].dailyData.push(metric);
    return acc;
  }, {} as Record<string, any>);

  // Get all unique dates, sorted chronologically
  const allDates = Array.from(
    new Set(metrics.map(m => m.date.toISOString().split('T')[0]))
  ).sort();

  // Transform to clear structure: [{product, data}, ...]
  return Object.values(productGroups).map((group: any) => {
    // Prepare data arrays for this product
    const inventoryData: number[] = [];
    const procurementData: number[] = [];
    const salesData: number[] = [];

    allDates.forEach(dateStr => {
      const dayMetric = group.dailyData.find((m: any) => 
        m.date.toISOString().split('T')[0] === dateStr
      );

      if (dayMetric) {
        // Inventory: opening inventory for that day
        inventoryData.push(dayMetric.openingInventory);
        
        // Procurement Amount = Qty × Unit Price
        const procurementAmount = dayMetric.procurementQty * Number(dayMetric.procurementUnitPrice || 0);
        procurementData.push(Math.round(procurementAmount * 100) / 100);
        
        // Sales Amount = Qty × Unit Price
        const salesAmount = dayMetric.salesQty * Number(dayMetric.salesUnitPrice || 0);
        salesData.push(Math.round(salesAmount * 100) / 100);
      } else {
        // No data for this date
        inventoryData.push(0);
        procurementData.push(0);
        salesData.push(0);
      }
    });

    return {
      product: group.product,
      data: {
        dates: allDates,
        inventory: inventoryData,
        procurement: procurementData,
        sales: salesData
      }
    };
  });
}