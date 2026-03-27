// ==========================================
// BACKEND: MASTER MONITOR v23 (AUDIT + MESSAGING ENABLED)
// ==========================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const props = PropertiesService.getScriptProperties();
    let logs = JSON.parse(props.getProperty('LOGS') || '[]');

    // --- 1. RECEPCIÓN DE LOGS DE DISPOSITIVOS ---
    // Guardamos todos los datos que envíe la app, fijos y dinámicos (metadata)
    const newLog = {
      timestamp: new Date().toISOString(),
      deviceId: data.deviceId || 'Desconocido',
      event: data.event || 'LOG',
      message: data.message || '',
      os: data.os || '',
      model: data.model || '',
      ip: data.ip || '0.0.0.0',
      usuario: data.usuario || 'Anónimo',
      version: data.version || 'v1.0.8',
      
      // Datos extra de soporte (email, teléfono, batería, memoria, ubicación, etc.)
      metadata: data.metadata || {} 
    };
    
    // Si la app envía directamente campos como email o phone, los capturamos
    if (data.email) newLog.metadata.email = data.email;
    if (data.phone) newLog.metadata.phone = data.phone;
    if (data.errorDetails) newLog.metadata.errorDetails = data.errorDetails;

    logs.push(newLog);
    // Ampliamos el límite de logs para tener más historial de los nuevos datos
    if (logs.length > 200) logs = logs.slice(-200);
    props.setProperty('LOGS', JSON.stringify(logs));
    
    // --- 2. RETORNO DE MENSAJES DE SOPORTE PARA EL DISPOSITIVO ---
    // Verificamos si hay mensajes pendientes para este deviceId y los devolvemos en la respuesta POST
    let messages = JSON.parse(props.getProperty('MESSAGES') || '{}');
    let pendingMessages = [];
    if (messages[newLog.deviceId] && messages[newLog.deviceId].length > 0) {
      pendingMessages = messages[newLog.deviceId];
      // Vaciamos los mensajes una vez enviados al cliente
      delete messages[newLog.deviceId];
      props.setProperty('MESSAGES', JSON.stringify(messages));
    }
    
    return createJsonResponse({ status: 'success', pendingMessages: pendingMessages });
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

    // --- ELIMINAR TODOS LOS LOGS ---
    if (e.parameter.deleteAll === 'true') {
      props.setProperty('LOGS', '[]');
      return createJsonResponse({ status: 'all_deleted' });
    }

    // --- ELIMINAR LOGS DE UN DISPOSITIVO ---
    if (e.parameter.deleteDevice) {
      const targetId = e.parameter.deleteDevice;
      let logs = JSON.parse(props.getProperty('LOGS') || '[]');
      const filtered = logs.filter(l => l.deviceId !== targetId);
      props.setProperty('LOGS', JSON.stringify(filtered));
      return createJsonResponse({ status: 'deleted' });
    }

    // --- ENVIAR MENSAJE A UN DISPOSITIVO (Desde el Panel) ---
    if (e.parameter.sendMessageTo) {
      const targetId = e.parameter.sendMessageTo;
      const textMessage = e.parameter.msgText || 'Tienes un mensaje del soporte.';
      const msgType = e.parameter.msgType || 'info'; // 'info', 'warning', 'action_required'
      
      let messages = JSON.parse(props.getProperty('MESSAGES') || '{}');
      if (!messages[targetId]) messages[targetId] = [];
      
      messages[targetId].push({
        id: new Date().getTime(),
        type: msgType,
        text: textMessage,
        timestamp: new Date().toISOString()
      });
      
      props.setProperty('MESSAGES', JSON.stringify(messages));
      return createJsonResponse({ status: 'message_queued', target: targetId });
    }

    // --- RETORNO DE ESTADO ACTUAL (Logs y Mensajes en cola) ---
    let logs = JSON.parse(props.getProperty('LOGS') || '[]');
    let allMessages = JSON.parse(props.getProperty('MESSAGES') || '{}');
    
    const result = { logs: logs, queuedMessages: allMessages, status: 'OK' };

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