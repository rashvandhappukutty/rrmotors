function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Initialize headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      const headers = [
        'ID', 'CUSTOMER_NAME', 'EMAIL', 'PHONE', 'BIKE_ID', 
        'SECOND_HAND_BIKE_ID', 'BIKE_TYPE', 'ENQUIRY_TYPE', 
        'MESSAGE', 'BUDGET_RANGE', 'PREFERRED_CONTACT', 
        'STATUS', 'FOLLOW_UP_DATE', 'ASSIGNED_TO', 'NOTES', 
        'CREATED_AT', 'UPDATED_AT'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    // Generate ID
    const newId = sheet.getLastRow();
    const now = new Date();
    
    // Prepare row data
    const rowData = [
      newId,
      data.customer_name || '',
      data.email || '',
      data.phone || '',
      data.bike_id || '',
      data.second_hand_bike_id || '',
      data.bike_type || '',
      data.enquiry_type || '',
      data.message || '',
      data.budget_range || '',
      data.preferred_contact || '',
      data.status || 'New',
      data.follow_up_date || '',
      data.assigned_to || '',
      data.notes || '',
      now,
      now
    ];
    
    // Append row
    sheet.appendRow(rowData);
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput("API is running");
}