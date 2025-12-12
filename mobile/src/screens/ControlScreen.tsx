import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { RootStackParamList, CommandType, OperationMode } from '../types';
import { bleService, api } from '../services';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Control'>;
  route: RouteProp<RootStackParamList, 'Control'>;
};

const ControlScreen: React.FC<Props> = ({ navigation, route }) => {
  const { deviceId } = route.params;
  const [ledOn, setLedOn] = useState(false);
  const [mode, setMode] = useState<OperationMode>('AUTO');
  const [threshold, setThreshold] = useState(35);
  const [sending, setSending] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const lottieRef = useRef<LottieView>(null);

  const sendCommand = async (command: CommandType, payload?: Record<string, unknown>) => {
    setSending(command);

    try {
      await bleService.sendCommand(command, payload);
      await api.sendCommand(deviceId, { commandType: command, payload });

      setShowSuccess(true);
      lottieRef.current?.play();
      setTimeout(() => setShowSuccess(false), 1500);
    } catch (error: any) {
      console.error('Command failed:', error);
      Alert.alert('Command Failed', 'Failed to send command to device. Please try again.');
    } finally {
      setSending(null);
    }
  };

  const handleLedToggle = async (value: boolean) => {
    setLedOn(value);
    await sendCommand(value ? 'LED_ON' : 'LED_OFF');
  };

  const handleModeChange = async (newMode: OperationMode) => {
    setMode(newMode);
    await sendCommand(newMode === 'AUTO' ? 'MODE_AUTO' : 'MODE_MANUAL');
  };

  const handleThresholdChange = async (value: number) => {
    setThreshold(value);
  };

  const handleThresholdSubmit = async () => {
    await sendCommand('SET_THRESHOLD', { threshold });
  };

  const handleEmergencyStop = () => {
    Alert.alert(
      'Emergency Stop',
      'Are you sure you want to trigger an emergency stop? This will immediately halt all operations.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: async () => {
            await sendCommand('EMERGENCY_STOP');
            Alert.alert('Emergency Stop', 'Emergency stop command sent successfully');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* LED Control Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardIcon, { backgroundColor: Colors.yellow + '20' }]}>
                <Text style={styles.cardIconText}>💡</Text>
              </View>
              <Text style={styles.cardTitle}>LED Control</Text>
            </View>
            {(sending === 'LED_ON' || sending === 'LED_OFF') && (
              <ActivityIndicator size="small" color={Colors.primary} />
            )}
          </View>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Power</Text>
            <View style={styles.switchContainer}>
              <Text style={[styles.switchState, { color: ledOn ? Colors.success : Colors.tertiaryLabel }]}>
                {ledOn ? 'On' : 'Off'}
              </Text>
              <Switch
                value={ledOn}
                onValueChange={handleLedToggle}
                trackColor={{ false: Colors.systemGray5, true: Colors.success + '40' }}
                thumbColor={ledOn ? Colors.success : Colors.white}
                ios_backgroundColor={Colors.systemGray5}
              />
            </View>
          </View>
          
          <View style={styles.ledPreview}>
            <View
              style={[
                styles.ledIndicator,
                { 
                  backgroundColor: ledOn ? Colors.yellow : Colors.systemGray4,
                  shadowColor: ledOn ? Colors.yellow : 'transparent',
                  shadowOpacity: ledOn ? 0.8 : 0,
                },
              ]}
            />
          </View>
        </View>

        {/* Mode Control Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardIcon, { backgroundColor: Colors.purple + '20' }]}>
                <Text style={styles.cardIconText}>⚙️</Text>
              </View>
              <Text style={styles.cardTitle}>Operation Mode</Text>
            </View>
            {(sending === 'MODE_AUTO' || sending === 'MODE_MANUAL') && (
              <ActivityIndicator size="small" color={Colors.primary} />
            )}
          </View>
          
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                mode === 'AUTO' && styles.segmentButtonActive,
              ]}
              onPress={() => handleModeChange('AUTO')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.segmentButtonText,
                  mode === 'AUTO' && styles.segmentButtonTextActive,
                ]}
              >
                Automatic
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                mode === 'MANUAL' && styles.segmentButtonActive,
              ]}
              onPress={() => handleModeChange('MANUAL')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.segmentButtonText,
                  mode === 'MANUAL' && styles.segmentButtonTextActive,
                ]}
              >
                Manual
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Threshold Control Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardIcon, { backgroundColor: Colors.orange + '20' }]}>
                <Text style={styles.cardIconText}>🌡️</Text>
              </View>
              <Text style={styles.cardTitle}>Temperature Threshold</Text>
            </View>
            {sending === 'SET_THRESHOLD' && (
              <ActivityIndicator size="small" color={Colors.primary} />
            )}
          </View>
          
          <View style={styles.thresholdContainer}>
            <Text style={styles.thresholdValue}>{threshold.toFixed(0)}°</Text>
            <Text style={styles.thresholdUnit}>Celsius</Text>
          </View>
          
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderBound}>20°</Text>
            <View style={styles.sliderTrack}>
              <View
                style={[
                  styles.sliderFill,
                  { width: `${((threshold - 20) / 30) * 100}%` },
                ]}
              />
              <View 
                style={[
                  styles.sliderThumb,
                  { left: `${((threshold - 20) / 30) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.sliderBound}>50°</Text>
          </View>
          
          <View style={styles.sliderButtons}>
            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => setThreshold(Math.max(20, threshold - 1))}
            >
              <Text style={styles.adjustButtonText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => setThreshold(Math.min(50, threshold + 1))}
            >
              <Text style={styles.adjustButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleThresholdSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.applyButtonText}>Apply Threshold</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Commands Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardIcon, { backgroundColor: Colors.systemGray5 }]}>
                <Text style={styles.cardIconText}>📋</Text>
              </View>
              <Text style={styles.cardTitle}>Recent Commands</Text>
            </View>
          </View>
          
          <View style={styles.historyList}>
            <View style={styles.historyItem}>
              <View style={styles.historyDot} />
              <Text style={styles.historyCommand}>LED_ON</Text>
              <Text style={styles.historyTime}>10:30 AM</Text>
            </View>
            <View style={styles.historyItem}>
              <View style={styles.historyDot} />
              <Text style={styles.historyCommand}>MODE_AUTO</Text>
              <Text style={styles.historyTime}>10:28 AM</Text>
            </View>
            <View style={styles.historyItem}>
              <View style={styles.historyDot} />
              <Text style={styles.historyCommand}>SET_THRESHOLD</Text>
              <Text style={styles.historyTime}>10:25 AM</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Emergency Stop Button */}
      <View style={styles.emergencyContainer}>
        <TouchableOpacity 
          style={styles.emergencyButton} 
          onPress={handleEmergencyStop}
          activeOpacity={0.9}
        >
          <Text style={styles.emergencyButtonText}>Emergency Stop</Text>
        </TouchableOpacity>
      </View>

      {/* Success Animation Overlay */}
      {showSuccess && (
        <View style={styles.successOverlay}>
          <LottieView
            ref={lottieRef}
            source={require('../assets/animations/success.json')}
            style={styles.successAnimation}
            autoPlay
            loop={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.large,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  cardIconText: {
    fontSize: 18,
  },
  cardTitle: {
    ...Typography.headline,
    color: Colors.label,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    ...Typography.body,
    color: Colors.label,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchState: {
    ...Typography.subheadline,
    marginRight: Spacing.sm,
  },
  ledPreview: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  ledIndicator: {
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.systemGray6,
    borderRadius: BorderRadius.medium,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.medium - 2,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: Colors.white,
    ...Shadows.small,
  },
  segmentButtonText: {
    ...Typography.subheadline,
    color: Colors.secondaryLabel,
    fontWeight: '500',
  },
  segmentButtonTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  thresholdContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  thresholdValue: {
    fontSize: 56,
    fontWeight: '300',
    color: Colors.label,
  },
  thresholdUnit: {
    ...Typography.subheadline,
    color: Colors.tertiaryLabel,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sliderBound: {
    ...Typography.caption1,
    color: Colors.tertiaryLabel,
    width: 30,
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.systemGray5,
    borderRadius: 3,
    marginHorizontal: Spacing.sm,
    position: 'relative',
  },
  sliderFill: {
    height: 6,
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    top: -7,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
    marginLeft: -10,
    ...Shadows.medium,
  },
  sliderButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  adjustButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.systemGray6,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
  },
  adjustButtonText: {
    fontSize: 24,
    color: Colors.primary,
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.medium,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  applyButtonText: {
    color: Colors.white,
    ...Typography.headline,
  },
  historyList: {
    marginTop: -Spacing.sm,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.separator,
  },
  historyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
    marginRight: Spacing.md,
  },
  historyCommand: {
    flex: 1,
    ...Typography.body,
    color: Colors.label,
    fontFamily: 'monospace',
  },
  historyTime: {
    ...Typography.caption1,
    color: Colors.tertiaryLabel,
  },
  emergencyContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    backgroundColor: Colors.background,
  },
  emergencyButton: {
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.medium,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    ...Shadows.medium,
  },
  emergencyButtonText: {
    color: Colors.white,
    ...Typography.headline,
    fontWeight: '700',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  successAnimation: {
    width: 150,
    height: 150,
  },
});

export default ControlScreen;
