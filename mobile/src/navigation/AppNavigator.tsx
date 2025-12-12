import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { RootStackParamList } from '../types';
import { Colors, Typography } from '../theme';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DeviceListScreen from '../screens/DeviceListScreen';
import BLEConnectScreen from '../screens/BLEConnectScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ControlScreen from '../screens/ControlScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        // Apple-style navigation bar
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.primary,
        headerTitleStyle: {
          ...Typography.headline,
          color: Colors.label,
        },
        headerShadowVisible: false,
        headerBackTitleVisible: Platform.OS === 'ios',
        headerBackTitle: 'Back',
        // Large title style for iOS
        headerLargeTitle: true,
        headerLargeTitleStyle: {
          ...Typography.largeTitle,
          color: Colors.label,
        },
        // Blur effect on iOS
        headerTransparent: false,
        headerBlurEffect: 'systemMaterial',
        // Animation
        animation: 'default',
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DeviceList"
        component={DeviceListScreen}
        options={{ 
          title: 'Devices',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="BLEConnect"
        component={BLEConnectScreen}
        options={{ 
          title: 'Scan',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ 
          title: 'Dashboard',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="Control"
        component={ControlScreen}
        options={{ 
          title: 'Control',
          headerLargeTitle: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
