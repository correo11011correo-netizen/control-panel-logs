# App Móvil de Monitoreo (En Desarrollo) 📱

Esta carpeta contiene el código base para compilar el Panel de Control en formato APK usando Expo / React Native.

## Plan de Desarrollo a Futuro

### Fase 1: App Wrapper (Actual)
Utilizamos `react-native-webview` para encapsular la página web de GitHub Pages en una app nativa. 
- **Ventaja:** Cualquier mejora que hagamos en el panel web (como el modo oscuro o gráficas) se reflejará inmediatamente en la App sin tener que lanzar actualizaciones del APK.
- **Uso:** Ideal para testear y tener el monitoreo a un toque de distancia desde tu celular.

### Fase 2: App Nativa Completa (Futuro)
Reescribir la interfaz usando componentes nativos de React Native para mayor fluidez.
- **Notificaciones Push:** Integrar Expo Notifications para que tu celular vibre y te avise si un cliente experimenta un `ERROR_FATAL` en tiempo real, incluso si tienes la App cerrada.
- **Autenticación:** Agregar una pantalla de PIN de seguridad.

## ¿Cómo probar la App Wrapper ahora?
1. Descarga esta rama (`mobile-app-dev`).
2. Entra a la carpeta `mobile-app`.
3. Ejecuta `npm install` y luego `npx expo install react-native-webview`.
4. Ejecuta `npx expo start` y escanea el QR con la app **Expo Go** en tu Android.
