// Google Sheets API Service
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyjm7ZlQwfvEZxfJY4OjKkz6vr-KTAdJVcTMYasghFniYTjhnojXf8BVuoEzmAPT9knWw/exec';

export const submitEnquiry = async (enquiryData) => {
  try {
    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enquiryData)
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error submitting enquiry:', error);
    throw error;
  }
};

export const testConnection = async () => {
  try {
    const response = await fetch(GOOGLE_SHEETS_URL);
    const result = await response.text();
    return result === "API is running";
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};