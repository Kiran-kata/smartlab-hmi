import axios from 'axios';

// Device Simulator - Simulates an ESP32 device sending sensor readings
// Run with: npm run simulate

const API_BASE = process.env.API_BASE || 'http://localhost:4000';
const DEVICE_ID = process.env.DEVICE_ID || '550e8400-e29b-41d4-a716-446655440000';
const INTERVAL_MS = parseInt(process.env.INTERVAL_MS || '3000', 10);

interface SimulatorState {
  mode: 'AUTO' | 'MANUAL';
  ledState: boolean;
  baseTemperature: number;
  baseHumidity: number;
}

const state: SimulatorState = {
  mode: 'AUTO',
  ledState: false,
  baseTemperature: 22,
  baseHumidity: 45,
};

function generateReading() {
  // Simulate realistic sensor fluctuations
  const tempVariation = (Math.random() - 0.5) * 2; // ±1°C
  const humidityVariation = (Math.random() - 0.5) * 5; // ±2.5%
  
  // Slowly drift the base values
  state.baseTemperature += (Math.random() - 0.5) * 0.1;
  state.baseHumidity += (Math.random() - 0.5) * 0.2;
  
  // Keep values in reasonable ranges
  state.baseTemperature = Math.max(15, Math.min(35, state.baseTemperature));
  state.baseHumidity = Math.max(30, Math.min(70, state.baseHumidity));
  
  return {
    temperature: parseFloat((state.baseTemperature + tempVariation).toFixed(2)),
    humidity: parseFloat((state.baseHumidity + humidityVariation).toFixed(2)),
  };
}

async function sendReading() {
  const reading = generateReading();
  
  try {
    const response = await axios.post(
      `${API_BASE}/devices/${DEVICE_ID}/readings`,
      reading
    );
    
    console.log(
      `[${new Date().toISOString()}] Sent reading:`,
      `Temp: ${reading.temperature}°C,`,
      `Humidity: ${reading.humidity}%`
    );
    
    // Check for safety threshold
    if (reading.temperature > 30) {
      console.log('⚠️  Warning: Temperature exceeds threshold!');
      await sendEvent('THRESHOLD_EXCEEDED', { temperature: reading.temperature });
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Failed to send reading:', error.message);
  }
}

async function sendEvent(eventType: string, payload: Record<string, unknown>) {
  try {
    await axios.post(`${API_BASE}/devices/${DEVICE_ID}/events`, {
      eventType,
      payload,
    });
    console.log(`[${new Date().toISOString()}] Sent event: ${eventType}`);
  } catch (error: any) {
    console.error('Failed to send event:', error.message);
  }
}

async function simulateButtonPress() {
  // Randomly simulate button presses
  if (Math.random() < 0.05) { // 5% chance per reading
    state.mode = state.mode === 'AUTO' ? 'MANUAL' : 'AUTO';
    console.log(`🔘 Button pressed! Mode changed to: ${state.mode}`);
    await sendEvent('MODE_CHANGED', { mode: state.mode });
    await sendEvent('BUTTON_PRESSED', { timestamp: new Date().toISOString() });
  }
}

async function main() {
  console.log('='.repeat(50));
  console.log('SmartLab Device Simulator');
  console.log('='.repeat(50));
  console.log(`API Base: ${API_BASE}`);
  console.log(`Device ID: ${DEVICE_ID}`);
  console.log(`Interval: ${INTERVAL_MS}ms`);
  console.log('='.repeat(50));
  console.log('');
  
  // Send initial connection event
  await sendEvent('DEVICE_CONNECTED', { 
    firmwareVersion: '1.0.0',
    timestamp: new Date().toISOString() 
  });
  
  // Start sending readings
  setInterval(async () => {
    await sendReading();
    await simulateButtonPress();
  }, INTERVAL_MS);
}

main().catch(console.error);
