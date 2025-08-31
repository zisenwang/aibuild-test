import { ROUTES, API_ENDPOINTS } from '@/constants';

// Protected page routes
export const PROTECTED_ROUTES = [ROUTES.DASHBOARD, ROUTES.UPLOAD];

// Protected API routes  
export const PROTECTED_API_ROUTES = [
  API_ENDPOINTS.PRODUCTS,
  API_ENDPOINTS.METRICS,
  API_ENDPOINTS.UPLOAD
];