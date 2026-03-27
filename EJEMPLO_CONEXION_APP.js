// ===================================================================
// 🚀 NUEVA VERSIÓN v24: SELECTOR DINÁMICO DE URL (NO DEPENDE DE URL FIJA)
// ===================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// 📡 ESTA ES TU "URL MAESTRA" EN GITHUB (Nunca cambia)
// Es el archivo que acabamos de crear en tu repositorio.
const REMOTE_CONFIG_URL = 'https://raw.githubusercontent.com/correo11011correo-netizen/control-panel-logs/main/remote_config.json';

// URL de Emergencia (En caso de que falle GitHub, para que no se pierdan los datos)
const BACKUP_URL = 'https://script.google.com/macros/s/AKfycbweUlhXJzUqqmcehuAkTs1MTJV4JVaYs3Y-UrMD6urtCdjP4SsyefgZAZo0AVFK6YU/exec';

/**
 * Función que busca la URL de monitoreo más reciente desde GitHub.
 * Se puede llamar al iniciar la App o antes de cada envío importante.
 */
const obtenerUrlMonitoreo = async () => {
  try {
    const respuesta = await fetch(REMOTE_CONFIG_URL);
    const config = await respuesta.json();
    
    if (config.active_monitor_url) {
      await AsyncStorage.setItem('@active_monitor_url', config.active_monitor_url);
      return config.active_monitor_url;
    }
  } catch (e) {
    console.log("No se pudo obtener config remota, usando cache o backup.");
  }
  
  // Si falla, intentamos usar la última que guardamos o la de backup
  const guardada = await AsyncStorage.getItem('@active_monitor_url');
  return guardada || BACKUP_URL;
};

/**
 * Registra un evento de forma dinámica.
 */
export const registrarEvento = async (tipo, mensaje, datosExtra = {}) => {
  try {
    // 1. Buscamos la URL activa (Dinámica)
    const monitorUrl = await obtenerUrlMonitoreo();
    
    let deviceId = await AsyncStorage.getItem('@device_id');
    if (!deviceId) {
      deviceId = `DEV-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      await AsyncStorage.setItem('@device_id', deviceId);
    }

    const payload = {
      deviceId: deviceId,
      event: tipo,
      message: mensaje,
      model: Constants.deviceName || 'Desconocido',
      os: `${Platform.OS} ${Platform.Version}`,
      version: Constants.expoConfig?.version || '1.0.0',
      usuario: datosExtra.nombre || await AsyncStorage.getItem('@user_name') || 'Anónimo',
      metadata: { ...datosExtra.metadata }
    };

    // 2. Enviamos a la URL obtenida dinámicamente
    const respuesta = await fetch(monitorUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });

    const data = await respuesta.json();

    // 3. Leer mensajes de soporte (opcional)
    if (data.pendingMessages && data.pendingMessages.length > 0) {
      data.pendingMessages.forEach(msg => {
        console.log(`Mensaje de Soporte: ${msg.text}`);
      });
    }

  } catch (e) {
    console.log("Monitor offline", e);
  }
};
