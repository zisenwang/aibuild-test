'use client';

import { Grid, Skeleton } from '@mui/material';
import { StatCard } from '@/components/cards/StatCard';
import { TrendingUp, Dashboard, Analytics, Inventory } from '@/lib/icons';
import type { MetricsData } from '@/app/(dashboard)/dashboard/actions';

interface StatCardsProps {
  data: MetricsData[];
  loading?: boolean;
}

interface CalculatedStats {
  totalRevenue: number;
  totalInventoryValue: number;
  totalProductsSold: number;
  activeProducts: number;
  revenueTrend: { value: number; isPositive: boolean };
  inventoryTrend: { value: number; isPositive: boolean };
}

function calculateStats(data: MetricsData[]): CalculatedStats {
  if (!data || data.length === 0) {
    return {
      totalRevenue: 0,
      totalInventoryValue: 0,
      totalProductsSold: 0,
      activeProducts: 0,
      revenueTrend: { value: 0, isPositive: true },
      inventoryTrend: { value: 0, isPositive: true }
    };
  }

  let totalRevenue = 0;
  let totalInventoryValue = 0;
  let totalProductsSold = 0;
  let firstHalfRevenue = 0;
  let secondHalfRevenue = 0;
  let firstHalfInventory = 0;
  let secondHalfInventory = 0;

  data.forEach(productData => {
    const { sales, inventory, procurement } = productData.data;
    
    // Calculate totals
    totalRevenue += sales.reduce((sum, val) => sum + val, 0);
    totalInventoryValue += inventory.reduce((sum, val) => sum + val, 0) / inventory.length; // Average inventory
    totalProductsSold += sales.length > 0 ? 1 : 0; // Count active products with sales
    
    // Calculate trends (first half vs second half)
    const midpoint = Math.floor(sales.length / 2);
    
    firstHalfRevenue += sales.slice(0, midpoint).reduce((sum, val) => sum + val, 0);
    secondHalfRevenue += sales.slice(midpoint).reduce((sum, val) => sum + val, 0);
    
    firstHalfInventory += inventory.slice(0, midpoint).reduce((sum, val) => sum + val, 0) / Math.max(midpoint, 1);
    secondHalfInventory += inventory.slice(midpoint).reduce((sum, val) => sum + val, 0) / Math.max(inventory.length - midpoint, 1);
  });

  // Calculate trend percentages
  const revenueTrendValue = firstHalfRevenue > 0 
    ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 
    : 0;
    
  const inventoryTrendValue = firstHalfInventory > 0 
    ? ((secondHalfInventory - firstHalfInventory) / firstHalfInventory) * 100 
    : 0;

  return {
    totalRevenue,
    totalInventoryValue: Math.round(totalInventoryValue),
    totalProductsSold,
    activeProducts: data.length,
    revenueTrend: { 
      value: Math.abs(Math.round(revenueTrendValue * 10) / 10), 
      isPositive: revenueTrendValue >= 0 
    },
    inventoryTrend: { 
      value: Math.abs(Math.round(inventoryTrendValue * 10) / 10), 
      isPositive: inventoryTrendValue >= 0 
    }
  };
}

export default function StatCards({ data, loading }: StatCardsProps) {
  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={i}>
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  const stats = calculateStats(data);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={TrendingUp}
          color="primary"
          subtitle="All time"
        />
      </Grid>
      
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard
          title="Average Inventory"
          value={stats.totalInventoryValue.toLocaleString()}
          icon={Inventory}
          color="secondary"
          subtitle="Units in stock"
        />
      </Grid>
      
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard
          title="Active Products"
          value={stats.activeProducts.toString()}
          icon={Dashboard}
          color="success"
          subtitle="With data"
        />
      </Grid>
      
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard
          title="Data Points"
          value={data.reduce((sum, p) => sum + p.data.dates.length, 0).toString()}
          icon={Analytics}
          color="info"
          subtitle="Total records"
        />
      </Grid>
    </Grid>
  );
}