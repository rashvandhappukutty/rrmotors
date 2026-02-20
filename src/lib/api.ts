export const API_URL = import.meta.env.VITE_API_URL || '/api';

// Helper: fetch with retry logic, timeout, and better error handling for production
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds
const REQUEST_TIMEOUT = 30000; // 30 seconds (Render free tier can take time to wake up)

async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await window.fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      lastError = error;

      // Don't retry if the request was intentionally aborted by the user
      if (error.name === 'AbortError') {
        console.warn(`⏱️ Request timeout for ${options?.method || 'GET'} ${url} (attempt ${attempt}/${MAX_RETRIES})`);
      } else {
        console.warn(`❌ Network error for ${options?.method || 'GET'} ${url} (attempt ${attempt}/${MAX_RETRIES}):`, error.message);
      }

      // If we have more retries, wait with exponential backoff
      if (attempt < MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
        console.log(`🔄 Retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries exhausted
  console.error(`❌ All ${MAX_RETRIES} attempts failed for ${options?.method || 'GET'} ${url}`);
  throw new Error(
    `Unable to reach the server after ${MAX_RETRIES} attempts. The server may be starting up — please wait a moment and try again.`
  );
}

interface BikeData {
  name: string;
  brand_id: number;
  price: string;
  category: string;
  specs: string;
  description?: string;
  image_url?: string;
  engine_cc?: number;
  horsepower?: number | string;
  availability?: boolean;
  stock_quantity?: number;
  year_model?: number;
  features?: string[];
}

interface SecondHandBikeData {
  name: string;
  brand_id: number;
  price: string;
  category: string;
  specs: string;
  description?: string;
  image_url?: string;
  availability?: boolean;
  features?: string[];
  
  // Second-hand specific fields (matching schema)
  condition: string; // Required in schema
  mileage?: string;
  year_manufacture?: number;
  owner_count?: number;
  registration_number?: string;
  engine_cc?: number;
  horsepower?: string;
  color?: string;
}

export const bikeAPI = {
  // ============================================
  // NEW BIKES API
  // ============================================
  
  // Get all new bikes
  async getAllBikes() {
    try {
      const response = await safeFetch(`${API_URL}/bikes`);
      if (!response.ok) throw new Error('Failed to fetch bikes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching bikes:', error);
      return [];
    }
  },

  // Get new bike by ID
  async getBikeById(id: number) {
    try {
      const response = await safeFetch(`${API_URL}/bikes/new/${id}`);
      if (!response.ok) throw new Error('Failed to fetch bike');
      return await response.json();
    } catch (error) {
      console.error('Error fetching bike:', error);
      return null;
    }
  },

  // Get bikes by brand ID
  async getBikesByBrand(brandId: number) {
    try {
      const response = await safeFetch(`${API_URL}/bikes/brand/${brandId}`);
      if (!response.ok) throw new Error('Failed to fetch bikes by brand');
      return await response.json();
    } catch (error) {
      console.error('Error fetching bikes by brand:', error);
      return [];
    }
  },

  // Get bikes by category
  async getBikesByCategory(category: string) {
    try {
      const response = await safeFetch(`${API_URL}/bikes/category/${category}`);
      if (!response.ok) throw new Error('Failed to fetch bikes by category');
      return await response.json();
    } catch (error) {
      console.error('Error fetching bikes by category:', error);
      return [];
    }
  },

  // Get all brands
  async getAllBrands() {
    try {
      const response = await safeFetch(`${API_URL}/bikes/brands/list`);
      if (!response.ok) throw new Error('Failed to fetch brands');
      return await response.json();
    } catch (error) {
      console.error('Error fetching brands:', error);
      return [];
    }
  },

  // Update brand
  async updateBrand(id: number, data: { name: string; country?: string; founded_year?: number }) {
    try {
      const response = await safeFetch(`${API_URL}/bikes/brands/list/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to update brand');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating brand:', error);
      throw error;
    }
  },

  // Delete brand
  async deleteBrand(id: number) {
    try {
      const response = await safeFetch(`${API_URL}/bikes/brands/list/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to delete brand');
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting brand:', error);
      throw error;
    }
  },

  // Create new bike
  async createBike(bikeData: BikeData) {
    try {
      const response = await safeFetch(`${API_URL}/bikes/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bikeData)
      });
      if (!response.ok) throw new Error('Failed to create bike');
      return await response.json();
    } catch (error) {
      console.error('Error creating bike:', error);
      return null;
    }
  },

  // Update bike
  async updateBike(id: number, bikeData: Partial<BikeData>) {
    try {
      const response = await safeFetch(`${API_URL}/bikes/new/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bikeData)
      });
      if (!response.ok) throw new Error('Failed to update bike');
      return await response.json();
    } catch (error) {
      console.error('Error updating bike:', error);
      return null;
    }
  },

  // Delete bike
  async deleteBike(id: number) {
    try {
      const response = await safeFetch(`${API_URL}/bikes/new/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete bike');
      return await response.json();
    } catch (error) {
      console.error('Error deleting bike:', error);
      return null;
    }
  },

  // ============================================
  // SECOND HAND BIKES API
  // ============================================

  // Get all second-hand bikes
  async getAllSecondHandBikes() {
    try {
      const response = await safeFetch(`${API_URL}/bikes/second-hand`);
      if (!response.ok) throw new Error('Failed to fetch second-hand bikes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching second-hand bikes:', error);
      return [];
    }
  },

  // Get second-hand bike by ID
  async getSecondHandBikeById(id: number) {
    try {
      const response = await safeFetch(`${API_URL}/bikes/second-hand/${id}`);
      if (!response.ok) throw new Error('Failed to fetch second-hand bike');
      return await response.json();
    } catch (error) {
      console.error('Error fetching second-hand bike:', error);
      return null;
    }
  },

  // Get second-hand bikes by brand ID
  async getSecondHandBikesByBrand(brandId: number) {
    try {
      const response = await safeFetch(`${API_URL}/bikes/second-hand/brand/${brandId}`);
      if (!response.ok) throw new Error('Failed to fetch second-hand bikes by brand');
      return await response.json();
    } catch (error) {
      console.error('Error fetching second-hand bikes by brand:', error);
      return [];
    }
  },

  // Get second-hand bikes by condition
  async getSecondHandBikesByCondition(condition: string) {
    try {
      const response = await safeFetch(`${API_URL}/bikes/second-hand/condition/${condition}`);
      if (!response.ok) throw new Error('Failed to fetch second-hand bikes by condition');
      return await response.json();
    } catch (error) {
      console.error('Error fetching second-hand bikes by condition:', error);
      return [];
    }
  },

  // Create second-hand bike
  async createSecondHandBike(bikeData: SecondHandBikeData) {
    try {
      const response = await safeFetch(`${API_URL}/bikes/second-hand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bikeData)
      });
      if (!response.ok) throw new Error('Failed to create second-hand bike');
      return await response.json();
    } catch (error) {
      console.error('Error creating second-hand bike:', error);
      return null;
    }
  },

  // Update second-hand bike
  async updateSecondHandBike(id: number, bikeData: Partial<SecondHandBikeData>) {
    try {
      const response = await safeFetch(`${API_URL}/bikes/second-hand/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bikeData)
      });
      if (!response.ok) throw new Error('Failed to update second-hand bike');
      return await response.json();
    } catch (error) {
      console.error('Error updating second-hand bike:', error);
      return null;
    }
  },

  // Delete second-hand bike
  async deleteSecondHandBike(id: number) {
    try {
      const response = await safeFetch(`${API_URL}/bikes/second-hand/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete second-hand bike');
      return await response.json();
    } catch (error) {
      console.error('Error deleting second-hand bike:', error);
      return null;
    }
  },

  // ============================================
  // ENQUIRY API
  // ============================================

  // Get all enquiries
  async getAllEnquiries() {
    try {
      const response = await safeFetch(`${API_URL}/bikes/enquiries`);
      if (!response.ok) throw new Error('Failed to fetch enquiries');
      return await response.json();
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      return [];
    }
  },

  // Get enquiry by ID
  async getEnquiryById(id: number) {
    try {
      const response = await safeFetch(`${API_URL}/bikes/enquiries/${id}`);
      if (!response.ok) throw new Error('Failed to fetch enquiry');
      return await response.json();
    } catch (error) {
      console.error('Error fetching enquiry:', error);
      return null;
    }
  },

  // Create new enquiry
  async createEnquiry(enquiryData: any) {
    try {
      // Try the primary endpoint first
      const response = await safeFetch(`${API_URL}/bikes/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enquiryData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to create enquiry`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating enquiry:', error);
      throw error;
    }
  },

  // Update enquiry
  async updateEnquiry(id: number, updates: any) {
    try {
      const response = await safeFetch(`${API_URL}/bikes/enquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update enquiry');
      return await response.json();
    } catch (error) {
      console.error('Error updating enquiry:', error);
      return null;
    }
  },

  // Delete enquiry
  async deleteEnquiry(id: number) {
    try {
      const response = await safeFetch(`${API_URL}/bikes/enquiries/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete enquiry');
      return await response.json();
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      return null;
    }
  }
};
