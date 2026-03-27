// ==============================================================
// 🛠️ EJEMPLO: CÓMO CONECTAR TU APP AL NUEVO PANEL DE CONTROL v23
// ==============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const MONITOR_URL = 'https://script.google.com/macros/s/AKfycbweUlhXJzUqqmcehuAkTs1MTJV4JVaYs3Y-UrMD6urtCdjP4SsyefgZAZo0AVFK6YU/exec';

/**
 * Registra un evento en el servidor central.
 * Ahora soporta enviar TODOS los datos que necesites dinámicamente.
 */
export const registrarEvento = async (tipo, mensaje, datosExtra = {}) => {
  try {
    let deviceId = await AsyncStorage.getItem('@device_id');
    if (!deviceId) {
      deviceId = `DEV-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      await AsyncStorage.setItem('@device_id', deviceId);
    }

    // 1. Preparamos los datos básicos
    const payload = {
      deviceId: deviceId,
      event: tipo,
      message: mensaje,
      model: Constants.deviceName || 'Dispositivo Desconocido',
      os: `${Platform.OS} ${Platform.Version}`,
      version: Constants.expoConfig?.version || '1.0.0',
      
      // 2. 🟢 AHORA PUEDES ENVIAR CUALQUIER COSA AQUÍ:
      email: datosExtra.email || await AsyncStorage.getItem('@user_email'),
      phone: datosExtra.phone || await AsyncStorage.getItem('@user_phone'),
      usuario: datosExtra.nombre || await AsyncStorage.getItem('@user_name') || 'Anónimo',
      
      // 3. Y también puedes mandar un objeto entero con más metadata:
      metadata: {
        bateria: datosExtra.bateria || '100%',
        ubicacion: datosExtra.ubicacion || 'Desconocida',
        memoriaLibre: datosExtra.memoria || '1GB',
        // Cualquier otro dato que se te ocurra en el futuro...
        ...datosExtra.metadata
      }
    };

    // 4. Enviamos al backend
    const respuesta = await fetch(MONITOR_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Importante para evitar CORS
      body: JSON.stringify(payload),
    });

    const data = await respuesta.json();

    // 5. 🔵 ¡NUEVO!: LEER MENSAJES DE SOPORTE
    // Si desde el panel web le enviaste un mensaje a este cliente, llegará aquí.
    if (data.pendingMessages && data.pendingMessages.length > 0) {
      console.log('¡TIENES MENSAJES NUEVOS DEL SOPORTE!');
      
      data.pendingMessages.forEach(msg => {
        // Aquí puedes mostrar un Alert o una notificación en tu App
        // Ej: Alert.alert('Soporte Técnico', msg.text);
        console.log(`Mensaje [${msg.type}]: ${msg.text}`);
      });
    }

  } catch (e) {
    console.log("Monitor offline", e);
  }
};

// ==============================================================
// 📋 EJEMPLOS DE USO EN TU APP
// ==============================================================

// Ejemplo 1: Log Normal (Como hacías antes)
// registrarEvento('INICIO', 'La aplicación se abrió');

// Ejemplo 2: Reportar un error con datos de contacto
// registrarEvento('ERROR', 'Fallo al guardar producto', {
//   email: 'cliente@gmail.com',
//   phone: '+54 376 4123456',
//   nombre: 'Celeste Sosa',
//   metadata: { 
//     producto_id: '12345',
//     pantalla: 'CrearProducto'
//   }
// });
