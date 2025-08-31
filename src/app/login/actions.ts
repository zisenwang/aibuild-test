import {API_ENDPOINTS} from '@/constants';

interface LoginResponse {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    username: string;
  };
}

export async function loginUser(username: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    return await response.json();
  } catch {
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
}