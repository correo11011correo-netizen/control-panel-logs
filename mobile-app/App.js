import React from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';

// V1: Aplicación envoltorio (Wrapper) del Dashboard Web
export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f7f6" />
      <WebView 
        source={{ uri: 'https://correo11011correo-netizen.github.io/control-panel-logs/' }} 
        style={styles.webview}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7f6',
  },
  webview: {
    flex: 1,
  },
});
