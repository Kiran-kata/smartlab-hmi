import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { RootStackParamList, Reading, DeviceStatus } from '../types';
import { wsService, api } from '../services';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
  route: RouteProp<RootStackParamList, 'Dashboard'>;
};

const GAUGE_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background: transparent; }
    canvas { display: block; }
  </style>
</head>
<body>
  <canvas id="gauge"></canvas>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script>
    let temperature = 25;
    let needle;
    
    function init() {
      const canvas = document.getElementById('gauge');
      const width = window.innerWidth;
      const height = 200;
      
      const scene = new THREE.Scene();
      scene.background = null;
      
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.z = 5;
      
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      
      // Create gauge arc - Apple blue
      const arcGeometry = new THREE.TorusGeometry(1.5, 0.1, 16, 100, Math.PI);
      const arcMaterial = new THREE.MeshBasicMaterial({ color: 0x007AFF });
      const arc = new THREE.Mesh(arcGeometry, arcMaterial);
      arc.rotation.z = Math.PI / 2;
      scene.add(arc);
      
      // Create needle
      const needleGeometry = new THREE.ConeGeometry(0.05, 1.3, 32);
      const needleMaterial = new THREE.MeshBasicMaterial({ color: 0xFF3B30 });
      needle = new THREE.Mesh(needleGeometry, needleMaterial);
      needle.position.y = 0.65;
      
      const pivotGeometry = new THREE.SphereGeometry(0.1, 32, 32);
      const pivotMaterial = new THREE.MeshBasicMaterial({ color: 0x1C1C1E });
      const pivot = new THREE.Mesh(pivotGeometry, pivotMaterial);
      
      const needleGroup = new THREE.Group();
      needleGroup.add(needle);
      needleGroup.add(pivot);
      scene.add(needleGroup);
      
      function animate() {
        requestAnimationFrame(animate);
        const targetAngle = ((temperature - 25) / 50) * Math.PI;
        needleGroup.rotation.z += (targetAngle - needleGroup.rotation.z) * 0.1;
        renderer.render(scene, camera);
      }
      
      animate();
    }
    
    window.updateTemperature = function(temp) {
      temperature = temp;
    };
    
    init();
  </script>
</body>
</html>
`;

const DashboardScreen: React.FC<Props> = ({ navigation, route }) => {
  const { deviceId } = route.params;
  const [reading, setReading] = useState<Reading | null>(null);
  const [status, setStatus] = useState<DeviceStatus>({
    mode: 'AUTO',
    ledState: false,
    threshold: 35,
    isConnected: false,
  });
  const [wsConnected, setWsConnected] = useState(false);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    wsService.connect(deviceId);

    const unsubReading = wsService.onReading((newReading) => {
      setReading(newReading);
      webViewRef.current?.injectJavaScript(
        `window.updateTemperature(${newReading.temperature}); true;`
      );
    });

    const unsubEvent = wsService.onEvent((event) => {
      if (event.eventType === 'MODE_CHANGED') {
        setStatus((prev) => ({ ...prev, mode: event.payload.mode as any }));
      } else if (event.eventType === 'LED_STATE_CHANGED') {
        setStatus((prev) => ({ ...prev, ledState: event.payload.state as boolean }));
      }
    });

    const unsubStatus = wsService.onConnectionStatus((connected) => {
      setWsConnected(connected === 'connected');
    });

    api.getLatestReading(deviceId).then((latestReading) => {
      if (latestReading) {
        setReading(latestReading);
      }
    });

    return () => {
      unsubReading();
      unsubEvent();
      unsubStatus();
      wsService.disconnect();
    };
  }, [deviceId]);

  const handleControlPress = () => {
    navigation.navigate('Control', { deviceId });
  };

  const getTemperatureColor = (temp: number): string => {
    if (temp > 40) return Colors.error;
    if (temp > 30) return Colors.warning;
    return Colors.success;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {/* Connection Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusItem}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: wsConnected ? Colors.success : Colors.error },
            ]}
          />
          <Text style={styles.statusText}>
            {wsConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.modePillText}>{status.mode}</Text>
        </View>
      </View>

      {/* 3D Gauge Card */}
      <View style={styles.gaugeCard}>
        <Text style={styles.sectionLabel}>TEMPERATURE</Text>
        <View style={styles.gaugeWrapper}>
          <WebView
            ref={webViewRef}
            source={{ html: GAUGE_HTML }}
            style={styles.gauge}
            scrollEnabled={false}
            javaScriptEnabled={true}
          />
        </View>
        <Text style={styles.gaugeValue}>
          {reading?.temperature?.toFixed(1) ?? '--'}
          <Text style={styles.gaugeUnit}>°C</Text>
        </Text>
      </View>

      {/* Sensor Readings */}
      <View style={styles.readingsRow}>
        <View style={styles.readingCard}>
          <View style={[styles.readingIcon, { backgroundColor: Colors.orange + '20' }]}>
            <Text style={styles.readingIconText}>🌡️</Text>
          </View>
          <Text style={styles.readingLabel}>Temperature</Text>
          <Text
            style={[
              styles.readingValue,
              { color: getTemperatureColor(reading?.temperature ?? 0) },
            ]}
          >
            {reading?.temperature?.toFixed(1) ?? '--'}°
          </Text>
          {reading && reading.temperature > 40 && (
            <View style={styles.warningBadge}>
              <Text style={styles.warningText}>HIGH</Text>
            </View>
          )}
        </View>

        <View style={styles.readingCard}>
          <View style={[styles.readingIcon, { backgroundColor: Colors.cyan + '20' }]}>
            <Text style={styles.readingIconText}>💧</Text>
          </View>
          <Text style={styles.readingLabel}>Humidity</Text>
          <Text style={styles.readingValue}>
            {reading?.humidity?.toFixed(1) ?? '--'}%
          </Text>
        </View>
      </View>

      {/* LED Status Card */}
      <View style={styles.ledCard}>
        <View style={styles.ledHeader}>
          <Text style={styles.sectionLabel}>LED STATUS</Text>
        </View>
        <View style={styles.ledContent}>
          <View
            style={[
              styles.ledBulb,
              { 
                backgroundColor: status.ledState ? Colors.yellow : Colors.systemGray4,
                shadowColor: status.ledState ? Colors.yellow : 'transparent',
              },
            ]}
          />
          <View style={styles.ledInfo}>
            <Text style={styles.ledStatus}>{status.ledState ? 'On' : 'Off'}</Text>
            <Text style={styles.ledSubtext}>Indicator Light</Text>
          </View>
        </View>
      </View>

      {/* Last Update */}
      {reading && (
        <Text style={styles.lastUpdate}>
          Last updated {new Date(reading.createdAt).toLocaleTimeString()}
        </Text>
      )}

      {/* Control Button */}
      <TouchableOpacity 
        style={styles.controlButton} 
        onPress={handleControlPress}
        activeOpacity={0.8}
      >
        <Text style={styles.controlButtonText}>Open Controls</Text>
      </TouchableOpacity>
      
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  statusText: {
    ...Typography.subheadline,
    color: Colors.secondaryLabel,
  },
  statusPill: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  modePillText: {
    ...Typography.caption1,
    color: Colors.primary,
    fontWeight: '600',
  },
  gaugeCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.medium,
  },
  sectionLabel: {
    ...Typography.caption1,
    color: Colors.secondaryLabel,
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  gaugeWrapper: {
    width: '100%',
    height: 180,
    borderRadius: BorderRadius.medium,
    overflow: 'hidden',
  },
  gauge: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  gaugeValue: {
    fontSize: 48,
    fontWeight: '300',
    color: Colors.label,
    marginTop: Spacing.md,
  },
  gaugeUnit: {
    fontSize: 24,
    fontWeight: '300',
    color: Colors.secondaryLabel,
  },
  readingsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  readingCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.large,
    padding: Spacing.lg,
    marginHorizontal: Spacing.xs,
    alignItems: 'center',
    ...Shadows.small,
  },
  readingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  readingIconText: {
    fontSize: 20,
  },
  readingLabel: {
    ...Typography.caption1,
    color: Colors.secondaryLabel,
    marginBottom: Spacing.xs,
  },
  readingValue: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.label,
  },
  warningBadge: {
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.small,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginTop: Spacing.sm,
  },
  warningText: {
    color: Colors.white,
    ...Typography.caption2,
    fontWeight: '600',
  },
  ledCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.large,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  ledHeader: {
    marginBottom: Spacing.md,
  },
  ledContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ledBulb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: Spacing.lg,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  ledInfo: {
    flex: 1,
  },
  ledStatus: {
    ...Typography.title3,
    color: Colors.label,
  },
  ledSubtext: {
    ...Typography.subheadline,
    color: Colors.secondaryLabel,
  },
  lastUpdate: {
    ...Typography.caption1,
    color: Colors.tertiaryLabel,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  controlButton: {
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    borderRadius: BorderRadius.medium,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    ...Shadows.small,
  },
  controlButtonText: {
    color: Colors.white,
    ...Typography.headline,
  },
  bottomPadding: {
    height: Spacing.xxxl,
  },
});

export default DashboardScreen;
