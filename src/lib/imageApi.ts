import { API_URL } from './api';

export const imageAPI = {
  // Upload bike image
  async uploadBikeImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);

      let response: Response;
      try {
        response = await fetch(`${API_URL}/upload/upload`, {
          method: 'POST',
          body: formData
        });
      } catch (networkError) {
        console.error('Network error uploading image:', networkError);
        return { success: false, message: 'Network error: Unable to reach the server.' };
      }

      if (!response.ok) throw new Error('Upload failed');
      return await response.json();
    } catch (error) {
      console.error('Error uploading image:', error);
      return { success: false, message: error.message };
    }
  },

  // Delete bike image
  async deleteBikeImage(publicId) {
    try {
      let response: Response;
      try {
        response = await fetch(`${API_URL}/upload/delete/${publicId}`, {
          method: 'DELETE'
        });
      } catch (networkError) {
        console.error('Network error deleting image:', networkError);
        return { success: false, message: 'Network error: Unable to reach the server.' };
      }

      if (!response.ok) throw new Error('Delete failed');
      return await response.json();
    } catch (error) {
      console.error('Error deleting image:', error);
      return { success: false, message: error.message };
    }
  },

  // Get optimized image variants
  async getImageVariants(publicId) {
    try {
      let response: Response;
      try {
        response = await fetch(`${API_URL}/upload/optimize/${publicId}`);
      } catch (networkError) {
        console.error('Network error getting image variants:', networkError);
        return { success: false, message: 'Network error: Unable to reach the server.' };
      }

      if (!response.ok) throw new Error('Failed to get variants');
      return await response.json();
    } catch (error) {
      console.error('Error getting image variants:', error);
      return { success: false, message: error.message };
    }
  }
};
