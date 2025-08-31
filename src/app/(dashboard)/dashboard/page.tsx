'use client';

import { useState, useCallback } from 'react';
import { Typography, Box, Stack } from '@mui/material';
import DashboardFilters from '@/components/dashboard/DashboardFilters';
import MetricsChart from '@/components/dashboard/MetricsChart';
import StatCards from '@/components/dashboard/StatCards';
import { fetchMetricsData, type MetricsData } from './actions';
import { useEffect } from 'react';

interface FilterState {
  products: string[];
  startDate: string;
  endDate: string;
}

export default function DashboardPage() {
  const [metricsData, setMetricsData] = useState<MetricsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    products: [],
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  });

  const loadMetrics = useCallback(async (filterState: FilterState) => {
    setLoading(true);
    try {
      const data = await fetchMetricsData(filterState);
      setMetricsData(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      setMetricsData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only load data if products are selected
    if (filters.products.length > 0) {
      loadMetrics(filters);
    }
  }, [filters, loadMetrics]);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  return (
    <Box>
      <Stack spacing={4}>
        <DashboardFilters onFiltersChange={handleFiltersChange} />
        
        <StatCards data={metricsData} loading={loading} />
        
        <MetricsChart data={metricsData} loading={loading} />
      </Stack>
    </Box>
  );
}