const express = require('express');
const router = express.Router();
const GoogleSheetsService = require('../utils/googleSheetsService');
const { createClient } = require('@supabase/supabase-js');

// Initialize services
const googleSheets = new GoogleSheetsService();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Sync enquiries from database to Google Sheets
router.post('/sync-to-sheets', async (req, res) => {
  try {
    const result = await googleSheets.syncDatabaseToSheets(supabase);
    res.json({
      success: true,
      message: 'Enquiries synced to Google Sheets successfully',
      data: result
    });
  } catch (error) {
    console.error('Sync to sheets error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create enquiry in both database and Google Sheets
router.post('/create-with-sheets', async (req, res) => {
  try {
    const enquiryData = req.body;

    // Create in database first
    const { data: dbEnquiry, error: dbError } = await supabase
      .from('enquiries')
      .insert([enquiryData])
      .select()
      .single();

    if (dbError) throw dbError;

    // Create in Google Sheets
    const sheetsResult = await googleSheets.createEnquiry({
      ...dbEnquiry,
      id: dbEnquiry.id
    });

    res.status(201).json({
      success: true,
      data: dbEnquiry,
      sheets: sheetsResult
    });
  } catch (error) {
    console.error('Create enquiry error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update enquiry in both database and Google Sheets
router.put('/:id/update-with-sheets', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Update in database
    const { data: dbEnquiry, error: dbError } = await supabase
      .from('enquiries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (dbError) throw dbError;

    // Update in Google Sheets
    const sheetsResult = await googleSheets.updateEnquiry(id, updates);

    res.json({
      success: true,
      data: dbEnquiry,
      sheets: sheetsResult
    });
  } catch (error) {
    console.error('Update enquiry error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get enquiries from Google Sheets
router.get('/from-sheets', async (req, res) => {
  try {
    const filters = req.query;
    const result = await googleSheets.getEnquiries(filters);
    
    res.json(result);
  } catch (error) {
    console.error('Get from sheets error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Auto-sync webhook (call this periodically)
router.post('/auto-sync', async (req, res) => {
  try {
    // Get latest enquiries from database (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: recentEnquiries, error } = await supabase
      .from('enquiries')
      .select('*')
      .gte('updated_at', yesterday.toISOString())
      .order('updated_at', { ascending: false });

    if (error) throw error;

    if (recentEnquiries.length > 0) {
      // Sync recent changes to Google Sheets
      for (const enquiry of recentEnquiries) {
        await googleSheets.updateEnquiry(enquiry.id, enquiry);
      }
    }

    res.json({
      success: true,
      message: `Auto-synced ${recentEnquiries.length} enquiries`,
      count: recentEnquiries.length
    });
  } catch (error) {
    console.error('Auto-sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;