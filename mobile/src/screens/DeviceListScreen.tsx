import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Device } from '../types';
import { api } from '../services';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DeviceList'>;
};

const DeviceListScreen: React.FC<Props> = ({ navigation }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async () => {
    try {
      setError(null);
      const deviceList = await api.getDevices();
      setDevices(deviceList);
    } catch (err: any) {
      console.error('Failed to fetch devices:', err);
      setError('Failed to load devices. Please try again.');
      // Add mock device in dev mode
      if (__DEV__) {
        setDevices([
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'SmartLab-001',
            firmwareVersion: '1.0.0',
            lastSeen: new Date().toISOString(),
          },
        ]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDevices();
  };

  const handleDevicePress = (device: Device) => {
    navigation.navigate('Dashboard', { deviceId: device.id });
  };

  const handleScanPress = () => {
    navigation.navigate('BLEConnect');
  };

  const renderDevice = ({ item }: { item: Device }) => (
    <TouchableOpacity
      style={styles.deviceCard}
      onPress={() => handleDevicePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.deviceContent}>
        <View style={styles.deviceIconContainer}>
          <View style={styles.deviceIcon}>
            <Text style={styles.deviceIconText}>📟</Text>
          </View>
        </View>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{item.name}</Text>
          <Text style={styles.deviceId}>{item.id.slice(0, 8)}...</Text>
          {item.firmwareVersion && (
            <Text style={styles.deviceFirmware}>v{item.firmwareVersion}</Text>
          )}
        </View>
        <View style={styles.deviceStatus}>
          <View
            style={[
              styles.statusDot,
              item.lastSeen ? styles.statusOnline : styles.statusOffline,
            ]}
          />
          <Text style={styles.chevron}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading devices...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderDevice}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={devices.length === 0 ? styles.emptyList : styles.listContent}
        ListHeaderComponent={
          <Text style={styles.sectionHeader}>MY DEVICES</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>📱</Text>
            </View>
            <Text style={styles.emptyText}>No Devices Found</Text>
            <Text style={styles.emptySubtext}>
              Scan for nearby SmartLab devices to get started
            </Text>
          </View>
        }
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.scanButton} 
          onPress={handleScanPress}
          activeOpacity={0.8}
        >
          <Text style={styles.scanButtonText}>Scan for Devices</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Spacing.lg,
    ...Typography.subheadline,
    color: Colors.secondaryLabel,
  },
  errorBanner: {
    backgroundColor: Colors.error + '15',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.medium,
  },
  errorText: {
    color: Colors.error,
    ...Typography.subheadline,
    textAlign: 'center',
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
    backgroundColor: Colors.primary + '15',
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
  deviceFirmware: {
    ...Typography.caption2,
    color: Colors.secondaryLabel,
    marginTop: 2,
  },
  deviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  statusOnline: {
    backgroundColor: Colors.success,
  },
  statusOffline: {
    backgroundColor: Colors.systemGray3,
  },
  chevron: {
    fontSize: 24,
    color: Colors.systemGray3,
    fontWeight: '300',
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
});

export default DeviceListScreen;
