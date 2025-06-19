import Cookies from "js-cookie";
import QRCode from 'qrcode';

export function getTime(){
  const now = new Date();
  const formatted = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ` +
                    `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  return formatted; // → "2025-06-03 20:45:00"
}

export async function generateQRCodeBase64(data) {
  try {
    console.log('Generating QR code for:', data);
    const base64 = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 200
    });
    console.log('QR code generated successfully, length:', base64.length);
    return base64;
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    return null;
  }
}

export function checkTokenExpired (navigateFunc, res) {
  if(res.error && res.error.code === 401){
    Cookies.remove("access_token");
    navigateFunc("/login");
  }
}

// Get a Spreadsheet's Information
export async function getSpreadsheetInfo (accessToken, spreadsheetId, navigateFunc, setSpreadsheetNameFunc, setsheetsObjFunc) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const data = await response.json();
  checkTokenExpired(navigateFunc, data);
  var tempsheetsObj = {};
  for(const sheetInfo of data.sheets){
      tempsheetsObj[sheetInfo.properties.title] = sheetInfo.properties.sheetId;
  }
  setSpreadsheetNameFunc(data.properties.title);
  setsheetsObjFunc(tempsheetsObj);
}

// Get data from a sheet
export async function getSheetData (accessToken, spreadsheetId, sheetTitle, range, majorDimension, navigateFunc) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetTitle}!${range}?majorDimension=${majorDimension}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const data = await response.json();
  checkTokenExpired(navigateFunc, data);
  if(data.values){
    return data.values;
  }
  return [];
}

// Update the data of a sheet
export async function updateSheetData (accessToken, spreadsheetId, sheetTitle, range, majorDimension, values, navigateFunc) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetTitle}!${range}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        majorDimension: majorDimension,
        values: values
      })
    }
  );
  const result = await response.json();
  checkTokenExpired(navigateFunc, result);
  if (response.ok) {
    console.log('Update successful:', result);
  } else {
    console.error('Update failed:', result);
  }
}