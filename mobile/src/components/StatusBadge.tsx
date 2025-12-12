import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

interface Props {
  label: string;
  isConnected: boolean;
  showDot?: boolean;
}

/**
 * Status Badge Component (Apple Style)
 * 
 * Displays a connection status indicator with a colored dot and label.
 * Follows Apple Human Interface Guidelines.
 */
const StatusBadge: React.FC<Props> = ({ label, isConnected, showDot = true }) => {
  const statusColor = isConnected ? Colors.success : Colors.error;
  
  return (
    <View style={styles.container}>
      {showDot && (
        <View
          style={[
            styles.dot,
            { backgroundColor: statusColor },
          ]}
        />
      )}
      <Text style={styles.label}>{label}</Text>
      <Text
        style={[
          styles.status,
          { color: statusColor },
        ]}
      >
        {isConnected ? 'Connected' : 'Disconnected'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.tertiaryBackground,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  label: {
    ...Typography.subheadline,
    color: Colors.secondaryLabel,
    marginRight: Spacing.xs,
  },
  status: {
    ...Typography.subheadline,
    fontWeight: '600',
  },
});

export default StatusBadge;
