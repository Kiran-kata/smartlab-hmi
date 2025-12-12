import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, BleDevice } from '../types';
import { bleService } from '../services';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BLEConnect'>;
};

const BLEConnectScreen: React.FC<Props> = ({ navigation }) => {
  const [devices, setDevices] = useState<Map<string, BleDevice>>(new Map());
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = bleService.onDeviceDiscovered((device) => {
      setDevices((prev) => {
        const newMap = new Map(prev);
        newMap.set(device.id, device);
        return newMap;
      });
    });

    return () => {
      unsubscribe();
      bleService.stopScan();
    };
  }, []);

  const handleScan = async () => {
    setDevices(new Map());
    setScanning(true);

    try {
      await bleService.startScan();

      // Stop scan after 10 seconds
      setTimeout(() => {
        bleService.stopScan();
        setScanning(false);
      }, 10000);
    } catch (error: any) {
      console.error('Scan failed:', error);
      setScanning(false);
    }
  };

  const handleStopScan = () => {
    bleService.stopScan();
    setScanning(false);
  };

  const handleConnect = async (device: BleDevice) => {
    setConnecting(device.id);

    try {
      const connected = await bleService.connect(device.id);

      if (connected) {
        navigation.navigate('Dashboard', { deviceId: device.id });
      } else {
        console.error('Failed to connect to device');
      }
    } catch (error: any) {
      console.error('Connection error:', error);
    } finally {
      setConnecting(null);
    }
  };

  const getSignalStrength = (rssi: number): string => {
    if (rssi > -50) return 'Excellent';
    if (rssi > -60) return 'Good';
    if (rssi > -70) return 'Fair';
    return 'Weak';
  };

  const getSignalColor = (rssi: number): string => {
    if (rssi > -50) return Colors.success;
    if (rssi > -60) return Colors.mint;
    if (rssi > -70) return Colors.warning;
    return Colors.error;
  };

  const getSignalBars = (rssi: number): number => {
    if (rssi > -50) return 4;
    if (rssi > -60) return 3;
    if (rssi > -70) return 2;
    return 1;
  };

  const renderSignalBars = (rssi: number) => {
    const bars = getSignalBars(rssi);
    const color = getSignalColor(rssi);
    return (
      <View style={styles.signalBars}>
        {[1, 2, 3, 4].map((bar) => (
          <View
            key={bar}
            style={[
              styles.signalBar,
              { 
                height: 4 + bar * 3,
                backgroundColor: bar <= bars ? color : Colors.systemGray5,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderDevice = ({ item }: { item: BleDevice }) => (
    <TouchableOpacity
      style={styles.deviceCard}
      onPress={() => handleConnect(item)}
      disabled={connecting !== null}
      activeOpacity={0.7}
    >
      <View style={styles.deviceContent}>
        <View style={styles.deviceIconContainer}>
          <View style={[styles.deviceIcon, { backgroundColor: Colors.cyan + '20' }]}>
            <Text style={styles.deviceIconText}>📡</Text>
          </View>
        </View>
        
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
          <Text style={styles.deviceId}>{item.id}</Text>
        </View>

        <View style={styles.signalContainer}>
          {connecting === item.id ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <>
              {renderSignalBars(item.rssi)}
              <Text style={styles.rssiText}>{item.rssi} dBm</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const deviceList = Array.from(devices.values()).sort((a, b) => b.rssi - a.rssi);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {/* Scanning indicator */}
      {scanning && (
        <View style={styles.scanningBanner}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.scanningText}>Scanning for devices...</Text>
        </View>
      )}

      <FlatList
        data={deviceList}
        keyExtractor={(item) => item.id}
        renderItem={renderDevice}
        contentContainerStyle={deviceList.length === 0 ? styles.emptyList : styles.listContent}
        ListHeaderComponent={
          deviceList.length > 0 ? (
            <Text style={styles.sectionHeader}>
              {deviceList.length} DEVICE{deviceList.length !== 1 ? 'S' : ''} FOUND
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>📡</Text>
            </View>
            <Text style={styles.emptyText}>
              {scanning ? 'Searching...' : 'No Devices Found'}
            </Text>
            <Text style={styles.emptySubtext}>
              {scanning 
                ? 'Looking for nearby SmartLab devices' 
                : 'Make sure your device is powered on and in range'}
            </Text>
          </View>
        }
      />

      <View style={styles.buttonContainer}>
        {scanning ? (
          <TouchableOpacity 
            style={styles.stopButton} 
            onPress={handleStopScan}
            activeOpacity={0.8}
          >
            <Text style={styles.stopButtonText}>Stop Scanning</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.scanButton} 
            onPress={handleScan}
            activeOpacity={0.8}
          >
            <Text style={styles.scanButtonText}>Start Scan</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scanningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary + '10',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.primary + '30',
  },
  scanningText: {
    marginLeft: Spacing.sm,
    color: Colors.primary,
    ...Typography.subheadline,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    ...Typography.footnote,
    color: Colors.secondaryLabel,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xl,
  },
  deviceCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.large,
    ...Shadows.small,
  },
  deviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  deviceIconContainer: {
    marginRight: Spacing.md,
  },
  deviceIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceIconText: {
    fontSize: 20,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    ...Typography.headline,
    color: Colors.label,
    marginBottom: 2,
  },
  deviceId: {
    ...Typography.caption1,
    color: Colors.tertiaryLabel,
    fontFamily: 'monospace',
  },
  signalContainer: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 16,
    marginBottom: 4,
  },
  signalBar: {
    width: 4,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  rssiText: {
    ...Typography.caption2,
    color: Colors.tertiaryLabel,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.systemGray6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyText: {
    ...Typography.title3,
    color: Colors.label,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    ...Typography.body,
    color: Colors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.background,
  },
  scanButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.medium,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    ...Shadows.small,
  },
  scanButtonText: {
    color: Colors.white,
    ...Typography.headline,
  },
  stopButton: {
    backgroundColor: Colors.systemGray5,
    borderRadius: BorderRadius.medium,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  stopButtonText: {
    color: Colors.label,
    ...Typography.headline,
  },
});

export default BLEConnectScreen;
