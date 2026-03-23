// ==========================================
// BACKEND: GOOGLE APPS SCRIPT
// ==========================================

const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI'; // <-- REEMPLAZA ESTO
const SHEET_NAME = 'Logs';

// 1. Configurar hoja (Ejecutar solo una vez manualmente desde el editor)
function setup() {
  let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = SpreadsheetApp.openById(SPREADSHEET_ID).insertSheet(SHEET_NAME);
  }
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'DeviceID', 'Evento', 'Mensaje', 'OS', 'Modelo']);
    // Dar estilo a las cabeceras
    sheet.getRange("A1:F1").setFontWeight("bold").setBackground("#d0e0e3");
  }
}

// 2. Recibir los logs desde la aplicación (Método POST)
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const data = JSON.parse(e.postData.contents);
    
    const timestamp = new Date();
    const deviceId = data.deviceId || 'Desconocido';
    const event = data.event || 'Log';
    const message = data.message || '';
    const os = data.os || '';
    const model = data.model || '';
    
    // Guardar el registro en la hoja de Google Sheets
    sheet.appendRow([timestamp, deviceId, event, message, os, model]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 3. Enviar logs a la página web (Método GET para el Dashboard en GitHub Pages)
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // Si solo hay cabeceras o la hoja está vacía
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ logs: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Convertir matriz de Sheets a Array de JSON (saltando cabeceras [1])
    const logs = data.slice(1).map(row => ({
      timestamp: row[0],
      deviceId: row[1],
      event: row[2],
      message: row[3],
      os: row[4],
      model: row[5]
    }));
    
    return ContentService.createTextOutput(JSON.stringify({ logs: logs }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}