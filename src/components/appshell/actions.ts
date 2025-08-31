'use client';

import { API_ENDPOINTS } from '@/constants';

export async function logout() {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      // Redirect to login page
      window.location.href = '/login';
    } else {
      console.error('Logout failed');
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
}