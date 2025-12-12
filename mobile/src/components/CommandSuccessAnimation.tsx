import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface Props {
  visible: boolean;
  onAnimationComplete?: () => void;
}

/**
 * Command Success Animation
 * 
 * Displays a Lottie animation overlay when a command is successfully sent
 * to the SmartLab device. Uses the checkmark success animation.
 */
const CommandSuccessAnimation: React.FC<Props> = ({ visible, onAnimationComplete }) => {
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      lottieRef.current?.play();
    } else {
      lottieRef.current?.reset();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.animationContainer}>
        <LottieView
          ref={lottieRef}
          source={require('../assets/animations/success.json')}
          style={styles.animation}
          autoPlay
          loop={false}
          onAnimationFinish={() => {
            onAnimationComplete?.();
          }}
        />
      </View>
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
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  animation: {
    width: 120,
    height: 120,
  },
});

export default CommandSuccessAnimation;
