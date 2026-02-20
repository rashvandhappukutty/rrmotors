const axios = require('axios');

class GoogleSheetsService {
  constructor() {
    // Replace with your Google Apps Script Web App URL
    this.scriptUrl = process.env.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
    this.apiKey = process.env.GOOGLE_SCRIPT_API_KEY || 'your_secret_api_key_here';
  }

  /**
   * Make API request to Google Apps Script
   */
  async makeRequest(action, data = {}) {
    try {
      const payload = {
        action,
        apikey: this.apiKey,
        ...data
      };

      const response = await axios.post(this.scriptUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Google Sheets API Error:', error.message);
      throw new Error(`Google Sheets operation failed: ${error.message}`);
    }
  }

  /**
   * Create a new enquiry in Google Sheets
   */
  async createEnquiry(enquiryData) {
    return await this.makeRequest('create_enquiry', {
      enquiry: enquiryData
    });
  }

  /**
   * Get all enquiries from Google Sheets
   */
  async getEnquiries(filters = {}) {
    return await this.makeRequest('get_enquiries', {
      filters
    });
  }

  /**
   * Update an existing enquiry
   */
  async updateEnquiry(id, updates) {
    return await this.makeRequest('update_enquiry', {
      id,
      updates
    });
  }

  /**
   * Delete an enquiry
   */
  async deleteEnquiry(id) {
    return await this.makeRequest('delete_enquiry', {
      id
    });
  }

  /**
   * Sync all enquiries to Google Sheets (bulk import)
   */
  async syncEnquiries(enquiries) {
    return await this.makeRequest('sync_enquiries', {
      enquiries
    });
  }

  /**
   * Sync database enquiries to Google Sheets
   */
  async syncDatabaseToSheets(supabase) {
    try {
      // Get all enquiries from database
      const { data: enquiries, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Sync to Google Sheets
      const result = await this.syncEnquiries(enquiries);
      
      console.log(`Synced ${enquiries.length} enquiries to Google Sheets`);
      return result;
    } catch (error) {
      console.error('Database sync error:', error.message);
      throw error;
    }
  }
}

module.exports = GoogleSheetsService;