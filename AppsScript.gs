// ==========================================
// BACKEND: MASTER MONITOR v20 (AUDIT ENABLED)
// ==========================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const props = PropertiesService.getScriptProperties();
    let logs = JSON.parse(props.getProperty('LOGS') || '[]');

    const newLog = {
      timestamp: new Date().toISOString(),
      deviceId: data.deviceId || 'Desconocido',
      event: data.event || 'LOG',
      message: data.message || '',
      os: data.os || '',
      model: data.model || '',
      ip: data.ip || '0.0.0.0',
      usuario: data.usuario || 'Anónimo',
      version: data.version || 'v1.0.8'
    };
    
    logs.push(newLog);
    if (logs.length > 50) logs = logs.slice(-50);
    props.setProperty('LOGS', JSON.stringify(logs));
    
    return createJsonResponse({ status: 'success' });
  } catch (error) {
    return createJsonResponse({ status: 'error', detail: error.toString() });
  }
}

function doGet(e) {
  try {
    const props = PropertiesService.getScriptProperties();
    
    // --- CANAL DE AUDITORÍA PARA IA ---
    if (e.parameter.audit === 'true') {
      return ContentService.createTextOutput(props.getProperty('LOGS') || "[]")
        .setMimeType(ContentService.MimeType.TEXT);
    }

    if (e.parameter.deleteDevice) {
      const targetId = e.parameter.deleteDevice;
      let logs = JSON.parse(props.getProperty('LOGS') || '[]');
      const filtered = logs.filter(l => l.deviceId !== targetId);
      props.setProperty('LOGS', JSON.stringify(filtered));
      return createJsonResponse({ status: 'deleted' });
    }

    let logs = JSON.parse(props.getProperty('LOGS') || '[]');
    const result = { logs: logs, status: 'OK' };

    // SOPORTE JSONP PARA EL MONITOR WEB
    const callback = e.parameter.callback;
    if (callback) {
      return ContentService.createTextOutput(callback + "(" + JSON.stringify(result) + ")")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return createJsonResponse(result);
  } catch (error) {
    return createJsonResponse({ status: 'error', detail: error.toString() });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
