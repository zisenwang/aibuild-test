'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Autocomplete,
  Stack,
  Chip
} from '@mui/material';
import { API_ENDPOINTS } from '@/constants';

interface Product {
  id: string;
  sku: string;
  name: string;
  _count: {
    metrics: number;
  };
}

interface DashboardFiltersProps {
  onFiltersChange: (filters: {
    products: string[];
    startDate: string;
    endDate: string;
  }) => void;
}

export default function DashboardFilters({ onFiltersChange }: DashboardFiltersProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-01-31');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    onFiltersChange({
      products: selectedProducts.map(p => p.id),
      startDate,
      endDate
    });
  }, [selectedProducts, startDate, endDate, onFiltersChange]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCTS);
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>
      
      <Stack spacing={3}>
        <Autocomplete
          multiple
          options={products}
          getOptionLabel={(option) => `${option.sku} - ${option.name}`}
          value={selectedProducts}
          onChange={(_, newValue) => setSelectedProducts(newValue)}
          loading={loading}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option.id}
                label={option.sku}
                size="small"
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Products"
              placeholder="Select products to analyze"
              helperText={
                selectedProducts.length === 0 
                  ? "All products will be included" 
                  : `${selectedProducts.length} product(s) selected`
              }
            />
          )}
          sx={{ minWidth: 300 }}
        />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Stack>
      </Stack>
    </Paper>
  );
}