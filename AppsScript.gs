// ==========================================
// BACKEND: GOOGLE APPS SCRIPT - MASTER MONITOR v16
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
      version: data.version || 'v1.0.0'
    };
    
    logs.push(newLog);
    if (logs.length > 500) logs = logs.slice(-500);
    props.setProperty('LOGS', JSON.stringify(logs));
    
    return createJsonResponse({ status: 'success', event: data.event });
  } catch (error) {
    return createJsonResponse({ status: 'error', detail: error.toString() });
  }
}

function doGet(e) {
  try {
    const props = PropertiesService.getScriptProperties();
    const action = e.parameter.action;

    if (action === 'ping') {
      return createJsonResponse({ status: 'pong', message: 'Servidor operativo', time: new Date().toISOString() });
    }

    if (e.parameter.clear === 'true') {
      props.deleteProperty('LOGS');
      return createJsonResponse({ status: 'cleared' });
    }

    if (e.parameter.deleteDevice) {
      const targetId = e.parameter.deleteDevice;
      let logs = JSON.parse(props.getProperty('LOGS') || '[]');
      const filtered = logs.filter(l => l.deviceId !== targetId);
      props.setProperty('LOGS', JSON.stringify(filtered));
      return createJsonResponse({ status: 'deleted', target: targetId });
    }

    let logs = JSON.parse(props.getProperty('LOGS') || '[]');
    return createJsonResponse({ logs: logs, status: 'OK' });
    
  } catch (error) {
    return createJsonResponse({ status: 'error', detail: error.toString() });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
