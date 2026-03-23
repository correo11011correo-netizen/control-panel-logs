# Panel de Control - App Logs 🛰️

Este repositorio contiene el frontend y backend para el sistema de monitoreo en tiempo real de instalaciones y eventos de la aplicación **Inventario Pro**.

## Enlaces del Sistema
- **Dashboard en Vivo:** [https://correo11011correo-netizen.github.io/control-panel-logs/](https://correo11011correo-netizen.github.io/control-panel-logs/)
- **API Endpoint (Google Apps Script):** `https://script.google.com/macros/s/AKfycbyi4iuMkqdQ5GrY2ODzkjDYumosOJUhJHzD3fGS_PMW1K9RNv5YXKbIPbMrfaud-qiGyA/exec`

## Arquitectura del Sistema
- **Frontend:** Tarjetas de dispositivos agrupadas y colapsables con contadores de errores y consola de diagnóstico en vivo.
- **Backend:** Script de Google optimizado que **utiliza la Memoria Interna Cacheada** (sin necesidad de Google Sheets). Esto elimina los problemas de permisos de Google, previene errores CORS y hace que el sistema sea extremadamente rápido.

---

## Implementación en el APK (React Native / Expo)

Para conectar la aplicación a este panel, debes implementar el siguiente código en tu archivo principal (normalmente `App.js` o el punto de entrada principal en la rama `native-rewrite`). No se necesita ninguna configuración extra en Google, todo está listo.

### 1. Instalar Dependencias Requeridas
Asegúrate de tener instalados los siguientes paquetes en tu proyecto Expo:

```bash
npx expo install @react-native-async-storage/async-storage expo-constants
```

### 2. Código a Inyectar en `App.js`

Agrega la lógica de rastreo dentro de tu componente principal para registrar instalaciones (INICIO), cierres (CIERRE) y errores fatales (ERROR_FATAL):

```javascript
import React, { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// URL de tu Google Apps Script Activo
const MONITOR_URL = 'https://script.google.com/macros/s/AKfycbyi4iuMkqdQ5GrY2ODzkjDYumosOJUhJHzD3fGS_PMW1K9RNv5YXKbIPbMrfaud-qiGyA/exec';

const registrarEvento = async (tipo, mensaje) => {
  try {
    // 1. Obtener o crear ID único del dispositivo (Persistente)
    let deviceId = await AsyncStorage.getItem('@device_id');
    if (!deviceId) {
      deviceId = `DEV-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      await AsyncStorage.setItem('@device_id', deviceId);
    }

    // 2. Enviar datos silenciosamente al backend (como texto plano para evitar CORS preflight)
    await fetch(MONITOR_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        deviceId: deviceId,
        event: tipo,
        message: mensaje,
        model: Constants.deviceName || 'Unknown Device',
        os: `${Platform.OS} ${Platform.Version}`
      }),
    });
  } catch (e) {
    console.log("Monitor offline", e);
  }
};

export default function App() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // A. REGISTRO AL INICIAR LA APP
    registrarEvento('INICIO', 'Aplicación iniciada/abierta');

    // B. REGISTRO AL CERRAR O PASAR A SEGUNDO PLANO
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        registrarEvento('CIERRE', 'La aplicación se envi\u00f3 a segundo plano o se cerr\u00f3');
      }
      appState.current = nextAppState;
    });

    // C. REGISTRO DE ERRORES FATALES
    if (global.ErrorUtils) {
      const originalHandler = global.ErrorUtils.getGlobalHandler();
      global.ErrorUtils.setGlobalHandler((error, isFatal) => {
        registrarEvento('ERROR_FATAL', `Error: ${error.message}`);
        if (originalHandler) {
          originalHandler(error, isFatal);
        }
      });
    }

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    // ... Tu c\u00f3digo original de la aplicaci\u00f3n o NavigationContainer ...
    <></>
  );
}
```

## Archivos en este Repositorio
- `index.html`: Es la interfaz web del Panel de Control hospedada en GitHub Pages. Muestra los logs agrupados por dispositivo en tarjetas colapsables.
- `AppsScript.gs`: El código fuente del servidor implementado en Google Apps Script que procesa y guarda temporalmente los logs.
