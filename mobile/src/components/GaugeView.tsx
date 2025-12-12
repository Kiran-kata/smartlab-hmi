import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
  value: number;
  minValue?: number;
  maxValue?: number;
  label?: string;
  unit?: string;
  warningThreshold?: number;
  dangerThreshold?: number;
}

/**
 * GaugeView Component
 * 
 * A 3D animated gauge visualization using Three.js rendered in a WebView.
 * This provides a visually rich way to display sensor readings like temperature.
 */
const GaugeView: React.FC<Props> = ({
  value,
  minValue = 0,
  maxValue = 50,
  label = 'Temperature',
  unit = '°C',
  warningThreshold = 35,
  dangerThreshold = 45,
}) => {
  const webViewRef = useRef<WebView>(null);

  // Generate the HTML for the 3D gauge
  const generateGaugeHTML = () => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      background: transparent;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #container { 
      width: 100vw; 
      height: 100vh; 
      position: relative;
    }
    canvas { display: block; }
    #valueDisplay {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
    }
    #value {
      font-size: 32px;
      font-weight: bold;
      color: #333;
    }
    #label {
      font-size: 14px;
      color: #666;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div id="container">
    <canvas id="gauge"></canvas>
    <div id="valueDisplay">
      <div id="value">${value.toFixed(1)}${unit}</div>
      <div id="label">${label}</div>
    </div>
  </div>
  
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script>
    // Configuration
    const config = {
      minValue: ${minValue},
      maxValue: ${maxValue},
      warningThreshold: ${warningThreshold},
      dangerThreshold: ${dangerThreshold},
      currentValue: ${value}
    };
    
    let scene, camera, renderer, needleGroup, arc;
    
    function init() {
      const canvas = document.getElementById('gauge');
      const container = document.getElementById('container');
      const width = container.clientWidth;
      const height = container.clientHeight - 80; // Leave room for value display
      
      // Scene setup
      scene = new THREE.Scene();
      
      // Camera
      camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
      camera.position.set(0, 0, 5);
      
      // Renderer
      renderer = new THREE.WebGLRenderer({ 
        canvas, 
        alpha: true, 
        antialias: true 
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setClearColor(0x000000, 0);
      
      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);
      
      // Create gauge arc (background)
      const arcRadius = 1.8;
      const arcGeometry = new THREE.TorusGeometry(arcRadius, 0.08, 16, 100, Math.PI);
      const arcMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xe0e0e0,
        shininess: 30
      });
      arc = new THREE.Mesh(arcGeometry, arcMaterial);
      arc.rotation.z = Math.PI / 2;
      arc.rotation.x = -0.2;
      scene.add(arc);
      
      // Create colored segments
      createColoredArc(arcRadius, 0, 0.7, 0x4caf50); // Green (safe)
      createColoredArc(arcRadius, 0.7, 0.9, 0xff9800); // Orange (warning)
      createColoredArc(arcRadius, 0.9, 1.0, 0xf44336); // Red (danger)
      
      // Create needle
      const needleGeometry = new THREE.ConeGeometry(0.04, 1.5, 16);
      const needleMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x333333,
        shininess: 50
      });
      const needle = new THREE.Mesh(needleGeometry, needleMaterial);
      needle.position.y = 0.75;
      
      // Pivot for needle
      const pivotGeometry = new THREE.SphereGeometry(0.12, 32, 32);
      const pivotMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x1a73e8,
        shininess: 80
      });
      const pivot = new THREE.Mesh(pivotGeometry, pivotMaterial);
      
      needleGroup = new THREE.Group();
      needleGroup.add(needle);
      needleGroup.add(pivot);
      scene.add(needleGroup);
      
      // Initial position
      updateNeedlePosition(config.currentValue);
      
      // Start animation loop
      animate();
    }
    
    function createColoredArc(radius, startPercent, endPercent, color) {
      const startAngle = (startPercent - 0.5) * Math.PI;
      const endAngle = (endPercent - 0.5) * Math.PI;
      const arcLength = endAngle - startAngle;
      
      const geometry = new THREE.TorusGeometry(radius, 0.12, 8, 32, arcLength);
      const material = new THREE.MeshPhongMaterial({ 
        color: color,
        shininess: 30
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.z = Math.PI / 2 - startAngle;
      mesh.rotation.x = -0.2;
      mesh.position.z = 0.01;
      scene.add(mesh);
    }
    
    function updateNeedlePosition(value) {
      const range = config.maxValue - config.minValue;
      const normalized = (value - config.minValue) / range;
      const clampedNormalized = Math.max(0, Math.min(1, normalized));
      
      // Map to angle (-PI/2 to PI/2)
      const targetAngle = (clampedNormalized - 0.5) * Math.PI;
      
      // Store for animation
      config.targetAngle = targetAngle;
    }
    
    function animate() {
      requestAnimationFrame(animate);
      
      // Smooth needle movement
      if (config.targetAngle !== undefined) {
        const currentAngle = needleGroup.rotation.z;
        needleGroup.rotation.z += (config.targetAngle - currentAngle) * 0.1;
      }
      
      renderer.render(scene, camera);
    }
    
    // Function to update from React Native
    window.updateGauge = function(newValue) {
      config.currentValue = newValue;
      updateNeedlePosition(newValue);
      
      // Update display
      document.getElementById('value').textContent = newValue.toFixed(1) + '${unit}';
      
      // Change color based on thresholds
      const valueElement = document.getElementById('value');
      if (newValue >= config.dangerThreshold) {
        valueElement.style.color = '#f44336';
      } else if (newValue >= config.warningThreshold) {
        valueElement.style.color = '#ff9800';
      } else {
        valueElement.style.color = '#4caf50';
      }
    };
    
    // Handle resize
    window.addEventListener('resize', () => {
      const container = document.getElementById('container');
      const width = container.clientWidth;
      const height = container.clientHeight - 80;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    
    // Initialize
    init();
  </script>
</body>
</html>
`;

  // Update gauge when value changes
  useEffect(() => {
    webViewRef.current?.injectJavaScript(
      `if(window.updateGauge) window.updateGauge(${value}); true;`
    );
  }, [value]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: generateGaugeHTML() }}
        style={styles.webview}
        scrollEnabled={false}
        javaScriptEnabled={true}
        originWhitelist={['*']}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default GaugeView;
