import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';

interface Props {
  visible: boolean;
  onAnimationComplete?: () => void;
}

/**
 * Command Success Animation
 * 
 * Displays an animated checkmark overlay when a command is successfully sent
 * to the SmartLab device. Uses native React Native Animated API.
 */
const CommandSuccessAnimation: React.FC<Props> = ({ visible, onAnimationComplete }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 5,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Hold for a moment then fade out
        setTimeout(() => {
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            scaleAnim.setValue(0);
            onAnimationComplete?.();
          });
        }, 800);
      });
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View 
        style={[
          styles.animationContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <View style={styles.checkCircle}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <Text style={styles.successText}>Success!</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
  },
  animationContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    alignItems: 'center',
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkmark: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  successText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
});

export default CommandSuccessAnimation;
