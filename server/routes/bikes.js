import express from 'express';
import { supabase } from '../config/supabase.js';
import { enquiryService } from '../services/enquiryService.js';

const router = express.Router();

// Cache for brands to avoid repeated queries
let brandsCache = null;
let lastBrandsCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ============================================
// HELPER FUNCTIONS
// ============================================

// Helper to get brands map for quick lookup (with caching)
async function getBrandsMap() {
  try {
    const now = Date.now();
    // Use cache if it's still fresh
    if (brandsCache && (now - lastBrandsCacheTime) < CACHE_DURATION) {
      return brandsCache;
    }

    const { data, error } = await supabase
      .from('brands')
      .select('*');

    if (error) throw error;

    const brandMap = {};
    data?.forEach(brand => {
      brandMap[brand.id] = brand;
    });

    // Update cache
    brandsCache = brandMap;
    lastBrandsCacheTime = now;

    return brandMap;
  } catch (error) {
    console.error('Error fetching brands map:', error);
    // Return empty map or cached version on error
    return brandsCache || {};
  }
}

// Helper to attach brands to bikes
function attachBrands(bikes, brandMap) {
  if (!bikes || bikes.length === 0) return bikes;

  return bikes.map(bike => ({
    ...bike,
    brands: brandMap[bike.brand_id] || { id: bike.brand_id, name: 'Unknown', logo_url: null }
  }));
}

// ============================================
// SHARED ENDPOINTS
// ============================================

// GET all brands
router.get('/brands/list', async (req, res) => {
  try {
    console.log('Fetching brands...');
    const { data, error } = await supabase
      .from('brands')
      .select('id, name, logo_url')
      .eq('active', true);

    if (error) {
      console.error('Supabase error fetching brands:', error);
      throw error;
    }
    console.log('Brands fetched:', data?.length || 0);
    res.json(data);
  } catch (error) {
    console.error('Error in GET /brands/list:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST create new brand (case-insensitive duplicate check)
router.post('/brands/list', async (req, res) => {
  try {
    const { name, country, founded_year, active = true } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Brand name is required' });
    }

    // Check if brand already exists (case-insensitive)
    const { data: existingBrand, error: selectError } = await supabase
      .from('brands')
      .select('id, name')
      .ilike('name', name.trim()); // case-insensitive search

    if (selectError) {
      console.error('Supabase error checking brand:', selectError);
      throw selectError;
    }

    if (existingBrand && existingBrand.length > 0) {
      return res.status(409).json({
        message: `Brand "${existingBrand[0].name}" already exists`,
        existing: existingBrand[0]
      });
    }

    // Create new brand
    const { data: newBrand, error: insertError } = await supabase
      .from('brands')
      .insert({
        name: name.trim(),
        country: country?.trim() || 'India',
        founded_year: founded_year || new Date().getFullYear(),
        active: active
      })
      .select();

    if (insertError) {
      console.error('Supabase error creating brand:', insertError);
      throw insertError;
    }

    // Clear brands cache to refresh on next fetch
    brandsCache = null;
    lastBrandsCacheTime = 0;

    console.log('Brand created successfully:', newBrand?.[0]);
    res.status(201).json(newBrand?.[0]);
  } catch (error) {
    console.error('Error in POST /brands/list:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT update brand name
router.put('/brands/list/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, country, founded_year } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Brand name is required' });
    }

    // Check if another brand with the same name already exists (case-insensitive)
    const { data: existingBrand, error: selectError } = await supabase
      .from('brands')
      .select('id, name')
      .ilike('name', name.trim())
      .neq('id', parseInt(id));

    if (selectError) throw selectError;

    if (existingBrand && existingBrand.length > 0) {
      return res.status(409).json({
        message: `Brand "${existingBrand[0].name}" already exists`,
        existing: existingBrand[0]
      });
    }

    const updateData = { name: name.trim() };
    if (country !== undefined) updateData.country = country.trim();
    if (founded_year !== undefined) updateData.founded_year = founded_year;

    const { data, error } = await supabase
      .from('brands')
      .update(updateData)
      .eq('id', parseInt(id))
      .select();

    if (error) throw error;

    // Clear brands cache
    brandsCache = null;
    lastBrandsCacheTime = 0;

    res.json(data?.[0]);
  } catch (error) {
    console.error('Error in PUT /brands/list/:id:', error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE brand
router.delete('/brands/list/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if any bikes are using this brand
    const { data: bikesUsingBrand, error: checkError } = await supabase
      .from('bikes')
      .select('id')
      .eq('brand_id', parseInt(id))
      .limit(1);

    if (checkError) throw checkError;

    // Also check second-hand bikes
    const { data: secondHandUsingBrand, error: checkError2 } = await supabase
      .from('second_hand_bikes')
      .select('id')
      .eq('brand_id', parseInt(id))
      .limit(1);

    if (checkError2) throw checkError2;

    if ((bikesUsingBrand && bikesUsingBrand.length > 0) || (secondHandUsingBrand && secondHandUsingBrand.length > 0)) {
      return res.status(400).json({
        message: 'Cannot delete brand that is being used by bikes. Remove or reassign those bikes first.'
      });
    }

    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', parseInt(id));

    if (error) throw error;

    // Clear brands cache
    brandsCache = null;
    lastBrandsCacheTime = 0;

    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /brands/list/:id:', error);
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// NEW BIKES ENDPOINTS
// ============================================

// GET all new bikes with brand info
router.get('/', async (req, res) => {
  try {
    const brandMap = await getBrandsMap();

    const { data, error } = await supabase
      .from('bikes')
      .select('*')
      .eq('availability', true);

    if (error) {
      console.error('Supabase error fetching bikes:', error);
      throw error;
    }

    const result = attachBrands(data, brandMap);
    res.json(result);
  } catch (error) {
    console.error('Error in GET /:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET bike by ID with brand info
router.get('/new/:id', async (req, res) => {
  try {
    const bikeId = parseInt(req.params.id);

    if (isNaN(bikeId) || bikeId <= 0) {
      console.log('Invalid bike ID received:', req.params.id);
      return res.status(400).json({ message: 'Invalid bike ID' });
    }

    console.log('Fetching bike by ID:', bikeId);
    const brandMap = await getBrandsMap();

    const { data, error } = await supabase
      .from('bikes')
      .select('*')
      .eq('id', bikeId)
      .single();

    if (error) {
      console.error('Supabase error fetching bike:', error);
      throw error;
    }
    if (!data) {
      console.log('No bike found with ID:', bikeId);
      return res.status(404).json({ message: 'Bike not found' });
    }

    const result = {
      ...data,
      brands: brandMap[data.brand_id] || { id: data.brand_id, name: 'Unknown', logo_url: null }
    };

    console.log('Bike fetched successfully:', result.id, result.name);
    res.json(result);
  } catch (error) {
    console.error('Error in GET /new/:id:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET bikes by category
router.get('/category/:category', async (req, res) => {
  try {
    const brandMap = await getBrandsMap();

    const { data, error } = await supabase
      .from('bikes')
      .select('*')
      .eq('category', req.params.category)
      .eq('availability', true);

    if (error) throw error;

    const result = attachBrands(data, brandMap);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET bikes by brand ID
router.get('/brand/:brandId', async (req, res) => {
  try {
    const brandMap = await getBrandsMap();

    const { data, error } = await supabase
      .from('bikes')
      .select('*')
      .eq('brand_id', req.params.brandId)
      .eq('availability', true);

    if (error) throw error;

    const result = attachBrands(data, brandMap);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE new bike
router.post('/new', async (req, res) => {
  try {
    const { brand_id, price, specs, features, ...bikeData } = req.body;

    if (!brand_id) {
      return res.status(400).json({ message: 'brand_id is required' });
    }

    // Format price with ₹ symbol and commas if not already formatted
    let formattedPrice = price;
    if (price) {
      let priceStr = price.toString().replace(/[₹,]/g, '');
      const priceNum = parseInt(priceStr);
      if (!isNaN(priceNum)) {
        formattedPrice = `₹${priceNum.toLocaleString('en-IN')}`;
      }
    }

    const processedData = {
      ...bikeData,
      brand_id,
      price: formattedPrice,
      specs: specs || 'Standard specifications',
      features: Array.isArray(features) ? features : [],
      availability: true
    };

    const { data, error } = await supabase
      .from('bikes')
      .insert([processedData])
      .select('*');

    if (error) throw error;

    const brandMap = await getBrandsMap();
    const result = attachBrands(data, brandMap);
    res.json(result[0]);
  } catch (error) {
    console.error('Error creating bike:', error);
    res.status(500).json({ message: error.message });
  }
});

// UPDATE bike
router.put('/new/:id', async (req, res) => {
  try {
    const { brand_id, features, ...updateData } = req.body;

    const updatePayload = {
      ...updateData,
      ...(brand_id && { brand_id }),
      ...(features && { features }),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('bikes')
      .update(updatePayload)
      .eq('id', req.params.id)
      .select('*');

    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ message: 'Bike not found' });

    const brandMap = await getBrandsMap();
    const result = attachBrands(data, brandMap);
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE bike
router.delete('/new/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('bikes')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Bike deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// SECOND HAND BIKES ENDPOINTS
// ============================================

// GET all second-hand bikes
router.get('/second-hand', async (req, res) => {
  try {
    const brandMap = await getBrandsMap();

    const { data, error } = await supabase
      .from('second_hand_bikes')
      .select('*')
      .eq('availability', true);

    if (error) throw error;

    const result = attachBrands(data, brandMap);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET second-hand bike by ID
router.get('/second-hand/:id', async (req, res) => {
  try {
    const brandMap = await getBrandsMap();

    const { data, error } = await supabase
      .from('second_hand_bikes')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Bike not found' });

    const result = {
      ...data,
      brands: brandMap[data.brand_id] || { id: data.brand_id, name: 'Unknown', logo_url: null }
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET second-hand bikes by condition
router.get('/second-hand/condition/:condition', async (req, res) => {
  try {
    const brandMap = await getBrandsMap();

    const { data, error } = await supabase
      .from('second_hand_bikes')
      .select('*')
      .eq('condition', req.params.condition)
      .eq('availability', true);

    if (error) throw error;

    const result = attachBrands(data, brandMap);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE second-hand bike
router.post('/second-hand', async (req, res) => {
  try {
    const { brand_id, features, ...bikeData } = req.body;

    if (!brand_id) {
      return res.status(400).json({ message: 'brand_id is required' });
    }

    const processedData = {
      ...bikeData,
      brand_id,
      features: Array.isArray(features) ? features : [],
      availability: true
    };

    const { data, error } = await supabase
      .from('second_hand_bikes')
      .insert([processedData])
      .select('*');

    if (error) throw error;

    const brandMap = await getBrandsMap();
    const result = attachBrands(data, brandMap);
    res.json(result[0]);
  } catch (error) {
    console.error('Error creating second-hand bike:', error);
    res.status(500).json({ message: error.message });
  }
});

// UPDATE second-hand bike
router.put('/second-hand/:id', async (req, res) => {
  try {
    const { brand_id, features, ...updateData } = req.body;

    const updatePayload = {
      ...updateData,
      ...(brand_id && { brand_id }),
      ...(features && { features }),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('second_hand_bikes')
      .update(updatePayload)
      .eq('id', req.params.id)
      .select('*');

    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ message: 'Bike not found' });

    const brandMap = await getBrandsMap();
    const result = attachBrands(data, brandMap);
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE second-hand bike
router.delete('/second-hand/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('second_hand_bikes')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Bike deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// ENQUIRY ENDPOINTS
// ============================================

// GET all enquiries
router.get('/enquiries', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET enquiry by ID
router.get('/enquiries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching enquiry:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST create new enquiry
router.post('/enquiries', async (req, res) => {
  try {
    const result = await enquiryService.submit(req.body);
    res.status(201).json(result.data);
  } catch (error) {
    console.error('Error in POST /enquiries:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST create new enquiry (alias endpoint for convenience)
router.post('/enquire', async (req, res) => {
  try {
    const enquiryData = req.body;

    // Validate required fields
    if (!enquiryData.customer_name || !enquiryData.phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }

    const result = await enquiryService.submit({
      ...enquiryData,
      enquiry_type: enquiryData.enquiry_type || 'General',
      status: enquiryData.status || 'New',
      bike_type: enquiryData.bike_type || 'new'
    });

    res.status(201).json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error in POST /enquire:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT update enquiry
router.put('/enquiries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('enquiries')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json(data?.[0] || {});
  } catch (error) {
    console.error('Error updating enquiry:', error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE enquiry
router.delete('/enquiries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('enquiries')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Enquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
