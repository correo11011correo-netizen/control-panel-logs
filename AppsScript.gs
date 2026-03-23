// ==========================================
// BACKEND: GOOGLE APPS SCRIPT (VERSIÓN SIN GOOGLE SHEETS)
// ==========================================
// Esta versión utiliza la memoria interna del Script (PropertiesService)
// para evitar problemas de permisos, CORS o pantallas de autorización.

const MAX_LOGS = 100; // Guardaremos los últimos 100 eventos en memoria

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const props = PropertiesService.getScriptProperties();
    
    // Obtener logs actuales
    let logs = [];
    const logsStr = props.getProperty('LOGS');
    if (logsStr) {
      logs = JSON.parse(logsStr);
    }
    
    // Agregar el nuevo log
    const newLog = {
      timestamp: new Date().toISOString(),
      deviceId: data.deviceId || 'Desconocido',
      event: data.event || 'Log',
      message: data.message || '',
      os: data.os || '',
      model: data.model || ''
    };
    
    logs.push(newLog);
    
    // Limitar la cantidad para no saturar la memoria
    if (logs.length > MAX_LOGS) {
      logs = logs.slice(logs.length - MAX_LOGS);
    }
    
    // Guardar en memoria interna
    props.setProperty('LOGS', JSON.stringify(logs));
    
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'success', 
      serverTime: new Date().toISOString(),
      receivedEvent: data.event
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'error', 
      message: error.toString(),
      serverTime: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    // Si mandan un parámetro ?clear=true, borramos la memoria
    if (e.parameter.clear === 'true') {
      PropertiesService.getScriptProperties().deleteProperty('LOGS');
      return ContentService.createTextOutput(JSON.stringify({ status: 'Memoria borrada' })).setMimeType(ContentService.MimeType.JSON);
    }

    const props = PropertiesService.getScriptProperties();
    let logs = [];
    const logsStr = props.getProperty('LOGS');
    if (logsStr) {
      logs = JSON.parse(logsStr);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      logs: logs,
      status: 'OK',
      serverTime: new Date().toISOString(),
      rowsProcessed: logs.length
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      error: error.toString(),
      serverTime: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}