import { google } from 'googleapis';
import { auth } from 'google-auth-library';

// Initialize Google Sheets API
// You'll need to set up credentials via Google Cloud Console

const sheets = google.sheets('v4');

export async function getGoogleSheetsData(spreadsheetId, range) {
  try {
    // This requires GOOGLE_APPLICATION_CREDENTIALS env variable
    const authClient = new auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });

    const response = await sheets.spreadsheets.values.get({
      auth: authClient,
      spreadsheetId: spreadsheetId,
      range: range
    });

    return response.data.values;
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw error;
  }
}

export async function appendToGoogleSheets(spreadsheetId, range, values) {
  try {
    const authClient = new auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const response = await sheets.spreadsheets.values.append({
      auth: authClient,
      spreadsheetId: spreadsheetId,
      range: range,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [values]
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error appending to Google Sheets:', error);
    throw error;
  }
}
