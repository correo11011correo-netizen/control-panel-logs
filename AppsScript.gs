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
      model: data.model || '',
      ip: data.ip || 'Desconocida',
      usuario: data.usuario || 'Anónimo'
    };
    
    logs.push(newLog);
    
    // Limitar la cantidad para no saturar la memoria (Aumentado a 300)
    if (logs.length > 300) {
      logs = logs.slice(logs.length - 300);
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
    const props = PropertiesService.getScriptProperties();

    // Si mandan un parámetro ?clear=true, borramos la memoria entera
    if (e.parameter.clear === 'true') {
      props.deleteProperty('LOGS');
      return ContentService.createTextOutput(JSON.stringify({ status: 'Memoria borrada' })).setMimeType(ContentService.MimeType.JSON);
    }

    // Si mandan un parámetro ?deleteDevice=DEVICE_ID, borramos solo ese dispositivo
    if (e.parameter.deleteDevice) {
      const targetId = e.parameter.deleteDevice;
      let logs = JSON.parse(props.getProperty('LOGS') || '[]');
      const filteredLogs = logs.filter(l => l.deviceId !== targetId);
      props.setProperty('LOGS', JSON.stringify(filteredLogs));
      return ContentService.createTextOutput(JSON.stringify({ status: `Dispositivo ${targetId} eliminado` })).setMimeType(ContentService.MimeType.JSON);
    }

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