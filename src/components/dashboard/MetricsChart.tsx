'use client';

import { useState } from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import type { MetricsData } from '@/app/(dashboard)/dashboard/actions';

interface MetricsChartProps {
  data: MetricsData[];
  loading?: boolean;
}

interface ChartSeries {
    data: number[];
    label: string;
    color: string;
    yAxisId?: string;
}

export default function MetricsChart({ data, loading }: MetricsChartProps) {
  const [highlightedSeries, setHighlightedSeries] = useState<string | null>(null);

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', minHeight: 400 }}>
        <Typography>Loading chart data...</Typography>
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', minHeight: 400 }}>
        <Typography variant="h6" gutterBottom>
          No Data Available
        </Typography>
        <Typography color="text.secondary">
          Select products and date range to view metrics, or upload data to get started
        </Typography>
      </Paper>
    );
  }

  // Combine all dates and sort them
  const allDates = Array.from(
    new Set(data.flatMap(d => d.data.dates))
  ).sort();

  // Create series for each metric type
  const series: ChartSeries[] = [];
  const colors = ['#1976d2', '#dc004e', '#ed6c02', '#2e7d32', '#9c27b0', '#d32f2f'];
  
  data.forEach((productData, productIndex) => {
    const baseColor = colors[productIndex % colors.length];
    
    // Map product data to all dates (fill missing with 0)
    const inventoryData = allDates.map(date => {
      const dateIndex = productData.data.dates.indexOf(date);
      return dateIndex >= 0 ? productData.data.inventory[dateIndex] : 0;
    });
    
    const procurementData = allDates.map(date => {
      const dateIndex = productData.data.dates.indexOf(date);
      return dateIndex >= 0 ? productData.data.procurement[dateIndex] : 0;
    });
    
    const salesData = allDates.map(date => {
      const dateIndex = productData.data.dates.indexOf(date);
      return dateIndex >= 0 ? productData.data.sales[dateIndex] : 0;
    });

    const inventoryLabel = `${productData.product.name} - Inventory`;
    const procurementLabel = `${productData.product.name} - Procurement $`;
    const salesLabel = `${productData.product.name} - Sales $`;

    series.push(
      {
        data: inventoryData,
        label: inventoryLabel,
        color: highlightedSeries && highlightedSeries !== inventoryLabel ? baseColor + '30' : baseColor,
        yAxisId: 'inventory',
      },
      {
        data: procurementData,
        label: procurementLabel,
        color: highlightedSeries && highlightedSeries !== procurementLabel ? baseColor + '30' : baseColor + '80',
        yAxisId: 'money',
      },
      {
        data: salesData,
        label: salesLabel,
        color: highlightedSeries && highlightedSeries !== salesLabel ? baseColor + '30' : baseColor + 'CC',
        yAxisId: 'money',
      }
    );
  });

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Product Metrics Over Time
      </Typography>
      
      <Box sx={{ width: '100%', height: 400 }}>
        <LineChart
          xAxis={[{
            data: allDates.map(date => new Date(date)),
            scaleType: 'time',
          }]}
          yAxis={[
            {
              id: 'money',
              scaleType: 'linear',
              label: 'Amount ($)',
              position: 'left',
              valueFormatter: (value) => `$${value.toLocaleString()}`,
            },
            {
              id: 'inventory',
              scaleType: 'linear',
              label: 'Inventory (Units)',
              position: 'right',
              valueFormatter: (value) => value.toLocaleString(),
            },
          ]}
          series={series}
          grid={{ horizontal: true, vertical: true }}
          margin={{ left: 80, right: 80, top: 20, bottom: 80 }}
          onHighlightChange={(highlightedItem) => {
            setHighlightedSeries(highlightedItem ? series[highlightedItem.dataIndex || 0]?.label || null : null);
          }}
          slotProps={{
            legend: {
              direction: 'vertical',
              position: { vertical: 'middle', horizontal: 'end' },
            },
          }}
        />
      </Box>
    </Paper>
  );
}