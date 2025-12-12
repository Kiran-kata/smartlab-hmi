import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);

    // Simulate login - in production, call your auth API
    setTimeout(() => {
      setLoading(false);
      navigation.replace('DeviceList');
    }, 1000);
  };

  const handleSkipLogin = () => {
    navigation.replace('DeviceList');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <View style={styles.logoContainer}>
        <View style={styles.logoWrapper}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>SL</Text>
          </View>
        </View>
        <Text style={styles.title}>SmartLab</Text>
        <Text style={styles.subtitle}>HMI Controller</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.placeholderText}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={Colors.placeholderText}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={handleSkipLogin}
          activeOpacity={0.6}
        >
          <Text style={styles.skipButtonText}>Continue without signing in</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>SmartLab HMI v1.0.0</Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl + 16,
  },
  logoWrapper: {
    marginBottom: Spacing.lg,
  },
  logoPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.large,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  title: {
    ...Typography.largeTitle,
    color: Colors.label,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.title3,
    color: Colors.secondaryLabel,
    fontWeight: '400',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.medium,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    ...Typography.body,
    color: Colors.label,
    ...Shadows.small,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.medium,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadows.small,
  },
  loginButtonDisabled: {
    backgroundColor: Colors.systemGray3,
  },
  loginButtonText: {
    color: Colors.white,
    ...Typography.headline,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginTop: Spacing.sm,
  },
  skipButtonText: {
    color: Colors.primary,
    ...Typography.body,
  },
  footer: {
    position: 'absolute',
    bottom: Spacing.xxxl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    color: Colors.tertiaryLabel,
    ...Typography.caption1,
  },
});

export default LoginScreen;
