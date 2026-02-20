import cloudinary from '../config/cloudinary.js';

export async function uploadBikeImage(fileBuffer, fileName) {
  try {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          public_id: `bikes/${fileName.replace(/\.[^/.]+$/, '')}`,
          folder: 'bikeshowroom/bikes',
          quality: 'auto',
          fetch_format: 'auto',
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(fileBuffer);
    });
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
}

export async function deleteBikeImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Image deletion failed: ${error.message}`);
  }
}

export async function getOptimizedImageUrl(publicId, options = {}) {
  try {
    const url = cloudinary.url(publicId, {
      fetch_format: 'auto',
      quality: 'auto',
      crop: 'fill',
      gravity: 'auto',
      ...options
    });
    return url;
  } catch (error) {
    throw new Error(`URL generation failed: ${error.message}`);
  }
}

export async function resizeBikeImage(publicId, width, height) {
  try {
    const url = cloudinary.url(publicId, {
      width: width,
      height: height,
      crop: 'fill',
      gravity: 'auto',
      fetch_format: 'auto',
      quality: 'auto'
    });
    return url;
  } catch (error) {
    throw new Error(`Image resize failed: ${error.message}`);
  }
}

// Transform image for different use cases
export function generateBikeImageVariants(publicId) {
  return {
    // Thumbnail for listings
    thumbnail: cloudinary.url(publicId, {
      width: 300,
      height: 300,
      crop: 'fill',
      gravity: 'auto',
      fetch_format: 'auto',
      quality: 'auto'
    }),
    // Medium for cards
    medium: cloudinary.url(publicId, {
      width: 500,
      height: 500,
      crop: 'fill',
      gravity: 'auto',
      fetch_format: 'auto',
      quality: 'auto'
    }),
    // Large for detail pages
    large: cloudinary.url(publicId, {
      width: 1200,
      height: 800,
      crop: 'fill',
      gravity: 'auto',
      fetch_format: 'auto',
      quality: 'auto'
    }),
    // Hero banner
    hero: cloudinary.url(publicId, {
      width: 1920,
      height: 1080,
      crop: 'fill',
      gravity: 'auto',
      fetch_format: 'auto',
      quality: 'auto'
    })
  };
}
