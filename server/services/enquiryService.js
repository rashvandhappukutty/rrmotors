import { supabase } from '../config/supabase.js';
import axios from 'axios';

/**
 * Service to handle all enquiry submissions with multi-storage redundancy.
 * Supports Supabase (PostgreSQL) and Google Sheets (Apps Script).
 */
export const enquiryService = {
    /**
     * Submit an enquiry to all configured storage backends.
     * @param {Object} data - The enquiry data
     * @returns {Promise<Object>} Status of each submission
     */
    async submit(data) {
        console.log('📝 [EnquiryService] Processing submission:', data.enquiry_type);

        const results = {
            supabase: { success: false },
            googleSheets: { success: false }
        };

        // 1. Storage: Supabase (Primary)
        try {
            const { data: insertedData, error } = await supabase
                .from('enquiries')
                .insert([data])
                .select();

            if (error) throw error;

            results.supabase = {
                success: true,
                data: insertedData?.[0] || {}
            };
            console.log('✅ [EnquiryService] Saved to Supabase');
        } catch (error) {
            console.error('❌ [EnquiryService] Supabase Error:', error.message);
            results.supabase.error = error.message;
        }

        // 2. Storage: Google Sheets (Redundant)
        const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
        if (scriptUrl && scriptUrl !== 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec') {
            try {
                const response = await axios.post(scriptUrl, data, {
                    timeout: 10000 // 10s timeout for Google Sheets
                });

                if (response.data && response.data.success) {
                    results.googleSheets = { success: true };
                    console.log('✅ [EnquiryService] Saved to Google Sheets');
                } else {
                    throw new Error(response.data?.error || 'Unknown response from Google Sheets');
                }
            } catch (error) {
                console.error('❌ [EnquiryService] Google Sheets Error:', error.message);
                results.googleSheets.error = error.message;
            }
        } else {
            console.warn('⚠️ [EnquiryService] Google Sheets URL not configured');
            results.googleSheets.error = 'Not configured';
        }

        // We consider it a success if at least ONE storage succeeded
        const isSuccess = results.supabase.success || results.googleSheets.success;

        if (!isSuccess) {
            throw new Error('All storage backends failed to save the enquiry');
        }

        return {
            success: true,
            results,
            data: results.supabase.data || results.googleSheets.data || {}
        };
    },

    /**
     * Get all enquiries from Supabase
     */
    async getAll() {
        const { data, error } = await supabase
            .from('enquiries')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }
};
