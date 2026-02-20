import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { API_URL } from './api';

const SUPABASE_URL = 'https://hncighhoeqmrvmdxdtns.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuY2lnaGhvZXFtcnZtZHhkdG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2ODg5MjMsImV4cCI6MjA4NTI2NDkyM30.hL7_QzOJozTJHqQlVpVL_vwp-659yv0X_n8ZQknZ1Ig';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin Login using username and password
export async function loginAdmin(username: string, password: string) {
  try {
    let response: Response;
    try {
      response = await fetch(`${API_URL}/auth/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });
    } catch (networkError) {
      console.error('Network error during login:', networkError);
      return { success: false, error: 'Network error: Unable to reach the server. Please check your connection.' };
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_username', data.admin.username);
      localStorage.setItem('admin_name', data.admin.name);
    }

    return { success: true, data: data.admin };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

// Get Admin Info
export async function getAdminInfo() {
  try {
    const token = localStorage.getItem('admin_token');
    
    if (!token) {
      return { success: false, error: 'Not logged in' };
    }

    let response: Response;
    try {
      response = await fetch(`${API_URL}/auth/admin`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (networkError) {
      console.error('Network error getting admin info:', networkError);
      return { success: false, error: 'Network error: Unable to reach the server.' };
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get admin info');
    }

    return { success: true, data };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

// Admin Logout
export async function logoutAdmin() {
  try {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    localStorage.removeItem('admin_name');
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

// Check if admin is logged in
export function isAdminLoggedIn(): boolean {
  return !!localStorage.getItem('admin_token');
}
