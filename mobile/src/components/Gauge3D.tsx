import React, { useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

// @ts-ignore - HTML asset import
const gaugeHtml = require('../assets/gauge.html');

interface Gauge3DProps {
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  label?: string;
  colorLow?: string;
  colorMid?: string;
  colorHigh?: string;
  thresholdMid?: number;
  thresholdHigh?: number;
  style?: ViewStyle;
  onReady?: () => void;
}

const Gauge3D: React.FC<Gauge3DProps> = ({
  value,
  min = 0,
  max = 100,
  unit = '%',
  label = 'Value',
  colorLow = '#4CAF50',
  colorMid = '#FFC107',
  colorHigh = '#F44336',
  thresholdMid = 50,
  thresholdHigh = 80,
  style,
  onReady,
}) => {
  const webViewRef = useRef<WebView>(null);
  const isReadyRef = useRef(false);

  // Send configuration on load
  const handleLoad = useCallback(() => {
    isReadyRef.current = true;
    
    const config = {
      min,
      max,
      unit,
      label,
      colorLow,
      colorMid,
      colorHigh,
      thresholdMid,
      thresholdHigh,
    };

    webViewRef.current?.postMessage(
      JSON.stringify({
        type: 'init',
        config,
        value,
      })
    );

    onReady?.();
  }, [min, max, unit, label, colorLow, colorMid, colorHigh, thresholdMid, thresholdHigh, value, onReady]);

  // Update value when it changes
  useEffect(() => {
    if (isReadyRef.current) {
      webViewRef.current?.postMessage(
        JSON.stringify({
          type: 'setValue',
          value,
        })
      );
    }
  }, [value]);

  // Update config when props change
  useEffect(() => {
    if (isReadyRef.current) {
      webViewRef.current?.postMessage(
        JSON.stringify({
          type: 'setConfig',
          config: {
            min,
            max,
            unit,
            label,
            colorLow,
            colorMid,
            colorHigh,
            thresholdMid,
            thresholdHigh,
          },
        })
      );
    }
  }, [min, max, unit, label, colorLow, colorMid, colorHigh, thresholdMid, thresholdHigh]);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    // Handle any messages from the WebView if needed
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Message from gauge:', data);
    } catch (e) {
      // Ignore parsing errors
    }
  }, []);

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={gaugeHtml}
        style={styles.webview}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onLoad={handleLoad}
        onMessage={handleMessage}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mixedContentMode="always"
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        androidLayerType="hardware"
        // Improve performance
        cacheEnabled={true}
        incognito={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 300,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    borderRadius: 150,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default Gauge3D;
