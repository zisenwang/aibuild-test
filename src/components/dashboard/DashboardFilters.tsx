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
import { fetchProducts, type Product } from '@/app/(dashboard)/dashboard/actions';


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
    loadProducts();
  }, []);

  useEffect(() => {
    // Only trigger filter change if products are selected or user has interacted
    if (selectedProducts.length > 0) {
      onFiltersChange({
        products: selectedProducts.map(p => p.id),
        startDate,
        endDate
      });
    }
  }, [selectedProducts, startDate, endDate, onFiltersChange]);

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
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
            value.map((option, index) => {
              const { key, ...chipProps } = getTagProps({ index });
              return (
                <Chip
                  key={option.id}
                  {...chipProps}
                  label={option.name}
                  size="small"
                />
              );
            })
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
            slotProps={{ 
              inputLabel: { shrink: true },
            }}
            sx={{
              '& input': {
                cursor: 'pointer'
              }
            }}
            fullWidth
          >

          </TextField>
          
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            slotProps={{ 
              inputLabel: { shrink: true },}}
            sx={{
              '& input': {
                cursor: 'pointer'
              }
            }}
            fullWidth
          />
        </Stack>
      </Stack>
    </Paper>
  );
}