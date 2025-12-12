import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

/**
 * Control Button Component (Apple Style)
 * 
 * A styled button for device control actions with loading state support.
 * Follows Apple Human Interface Guidelines.
 */
const ControlButton: React.FC<Props> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return Colors.systemGray4;
    switch (variant) {
      case 'primary':
        return Colors.primary;
      case 'secondary':
        return Colors.systemGray;
      case 'danger':
        return Colors.error;
      default:
        return Colors.primary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} size="small" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.large,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    ...Shadows.small,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    ...Typography.headline,
    color: Colors.white,
  },
});

export default ControlButton;
