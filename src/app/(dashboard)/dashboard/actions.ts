import { API_ENDPOINTS } from '@/constants';

export interface Product {
  id: string;
  sku: string;
  name: string;
  _count: {
    metrics: number;
  };
}

export interface MetricsData {
  product: {
    id: string;
    sku: string;
    name: string;
  };
  data: {
    dates: string[];
    inventory: number[];
    procurement: number[];
    sales: number[];
  };
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await fetch(API_ENDPOINTS.PRODUCTS);
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export async function fetchMetricsData(filters: {
  products: string[];
  startDate: string;
  endDate: string;
}): Promise<MetricsData[]> {
  try {
    const params = new URLSearchParams();
    
    if (filters.products.length > 0) {
      params.set('products', filters.products.join(','));
    }
    if (filters.startDate) {
      params.set('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params.set('endDate', filters.endDate);
    }

    const response = await fetch(`${API_ENDPOINTS.METRICS}?${params}`);
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Failed to fetch metrics data:', error);
    return [];
  }
}