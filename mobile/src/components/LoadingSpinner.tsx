import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface Props {
  size?: number;
  color?: string;
}

/**
 * Loading Spinner
 * 
 * Displays a Lottie loading animation.
 */
const LoadingSpinner: React.FC<Props> = ({ size = 100 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <LottieView
        source={require('../assets/animations/loading.json')}
        style={styles.animation}
        autoPlay
        loop
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});

export default LoadingSpinner;
