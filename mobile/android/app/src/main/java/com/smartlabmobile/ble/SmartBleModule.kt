package com.smartlabmobile.ble

import android.Manifest
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattCallback
import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothGattDescriptor
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothProfile
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanFilter
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.*

/**
 * SmartBle Native Module
 * 
 * Handles Bluetooth Low Energy (BLE) communication between the React Native app
 * and SmartLab devices. This module provides:
 * - Device scanning
 * - Connection management
 * - Characteristic read/write operations
 * - Notification subscriptions
 */
class SmartBleModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "SmartBle"
        
        // SmartLab BLE Service UUIDs
        private val SERVICE_UUID = UUID.fromString("0000180A-0000-1000-8000-00805F9B34FB")
        private val COMMAND_CHAR_UUID = UUID.fromString("00002A57-0000-1000-8000-00805F9B34FB")
        private val STATUS_CHAR_UUID = UUID.fromString("00002A58-0000-1000-8000-00805F9B34FB")
        private val SENSOR_CHAR_UUID = UUID.fromString("00002A59-0000-1000-8000-00805F9B34FB")
        
        // Client Characteristic Configuration Descriptor UUID
        private val CCCD_UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb")
        
        // Scan timeout in milliseconds
        private const val SCAN_TIMEOUT = 10000L
    }

    private var bluetoothAdapter: BluetoothAdapter? = null
    private var bluetoothGatt: BluetoothGatt? = null
    private var isScanning = false
    private val handler = Handler(Looper.getMainLooper())
    private val connectedDevices = mutableMapOf<String, BluetoothGatt>()
    
    // Pending promises for async operations
    private var connectPromise: Promise? = null
    private var writePromise: Promise? = null

    override fun getName(): String = "SmartBle"

    override fun initialize() {
        super.initialize()
        val bluetoothManager = reactContext.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        bluetoothAdapter = bluetoothManager.adapter
        Log.d(TAG, "SmartBle module initialized")
    }

    /**
     * Start scanning for BLE devices
     */
    @ReactMethod
    fun scanDevices() {
        Log.d(TAG, "Starting BLE scan")
        
        if (!checkPermissions()) {
            sendEvent("BleError", Arguments.createMap().apply {
                putString("error", "Bluetooth permissions not granted")
            })
            return
        }

        val scanner = bluetoothAdapter?.bluetoothLeScanner
        if (scanner == null) {
            sendEvent("BleError", Arguments.createMap().apply {
                putString("error", "Bluetooth not available")
            })
            return
        }

        if (isScanning) {
            Log.d(TAG, "Already scanning")
            return
        }

        isScanning = true

        // Build scan settings
        val settings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
            .build()

        // Optional: Filter for SmartLab devices only
        // val filters = listOf(
        //     ScanFilter.Builder()
        //         .setServiceUuid(ParcelUuid(SERVICE_UUID))
        //         .build()
        // )

        try {
            scanner.startScan(null, settings, scanCallback)
            
            // Auto-stop scan after timeout
            handler.postDelayed({
                stopScanInternal()
            }, SCAN_TIMEOUT)
            
            Log.d(TAG, "BLE scan started")
        } catch (e: SecurityException) {
            Log.e(TAG, "Security exception during scan", e)
            isScanning = false
        }
    }

    /**
     * Stop scanning for BLE devices
     */
    @ReactMethod
    fun stopScan() {
        Log.d(TAG, "Stopping BLE scan")
        stopScanInternal()
    }

    private fun stopScanInternal() {
        if (!isScanning) return
        
        try {
            bluetoothAdapter?.bluetoothLeScanner?.stopScan(scanCallback)
        } catch (e: SecurityException) {
            Log.e(TAG, "Security exception stopping scan", e)
        }
        
        isScanning = false
        Log.d(TAG, "BLE scan stopped")
    }

    /**
     * Connect to a BLE device
     */
    @ReactMethod
    fun connectToDevice(deviceId: String, promise: Promise) {
        Log.d(TAG, "Connecting to device: $deviceId")
        
        if (connectedDevices.containsKey(deviceId)) {
            Log.d(TAG, "Already connected to device")
            promise.resolve(true)
            return
        }

        val device = bluetoothAdapter?.getRemoteDevice(deviceId)
        if (device == null) {
            promise.reject("DEVICE_NOT_FOUND", "Device with ID $deviceId not found")
            return
        }

        connectPromise = promise
        
        try {
            bluetoothGatt = device.connectGatt(reactContext, false, gattCallback)
        } catch (e: SecurityException) {
            Log.e(TAG, "Security exception during connect", e)
            promise.reject("SECURITY_ERROR", "Bluetooth permission denied")
            connectPromise = null
        }
    }

    /**
     * Disconnect from a BLE device
     */
    @ReactMethod
    fun disconnectFromDevice(deviceId: String, promise: Promise) {
        Log.d(TAG, "Disconnecting from device: $deviceId")
        
        val gatt = connectedDevices[deviceId]
        if (gatt == null) {
            promise.resolve(null)
            return
        }

        try {
            gatt.disconnect()
            gatt.close()
            connectedDevices.remove(deviceId)
            
            sendEvent("BleConnectionState", Arguments.createMap().apply {
                putString("deviceId", deviceId)
                putBoolean("connected", false)
            })
            
            promise.resolve(null)
        } catch (e: SecurityException) {
            Log.e(TAG, "Security exception during disconnect", e)
            promise.reject("SECURITY_ERROR", "Bluetooth permission denied")
        }
    }

    /**
     * Write a command to the device
     */
    @ReactMethod
    fun writeCommand(deviceId: String, command: String, promise: Promise) {
        Log.d(TAG, "Writing command to device $deviceId: $command")
        
        val gatt = connectedDevices[deviceId]
        if (gatt == null) {
            promise.reject("NOT_CONNECTED", "Not connected to device $deviceId")
            return
        }

        val service = gatt.getService(SERVICE_UUID)
        if (service == null) {
            promise.reject("SERVICE_NOT_FOUND", "SmartLab service not found")
            return
        }

        val characteristic = service.getCharacteristic(COMMAND_CHAR_UUID)
        if (characteristic == null) {
            promise.reject("CHAR_NOT_FOUND", "Command characteristic not found")
            return
        }

        writePromise = promise
        
        try {
            characteristic.value = command.toByteArray()
            characteristic.writeType = BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT
            
            if (!gatt.writeCharacteristic(characteristic)) {
                promise.reject("WRITE_FAILED", "Failed to write characteristic")
                writePromise = null
            }
        } catch (e: SecurityException) {
            Log.e(TAG, "Security exception during write", e)
            promise.reject("SECURITY_ERROR", "Bluetooth permission denied")
            writePromise = null
        }
    }

    /**
     * Subscribe to notifications from the device
     */
    @ReactMethod
    fun subscribeToNotifications(deviceId: String, promise: Promise) {
        Log.d(TAG, "Subscribing to notifications for device: $deviceId")
        
        val gatt = connectedDevices[deviceId]
        if (gatt == null) {
            promise.reject("NOT_CONNECTED", "Not connected to device $deviceId")
            return
        }

        val service = gatt.getService(SERVICE_UUID)
        if (service == null) {
            promise.reject("SERVICE_NOT_FOUND", "SmartLab service not found")
            return
        }

        try {
            // Subscribe to status characteristic
            val statusChar = service.getCharacteristic(STATUS_CHAR_UUID)
            if (statusChar != null) {
                enableNotification(gatt, statusChar)
            }

            // Subscribe to sensor characteristic
            val sensorChar = service.getCharacteristic(SENSOR_CHAR_UUID)
            if (sensorChar != null) {
                enableNotification(gatt, sensorChar)
            }

            promise.resolve(null)
        } catch (e: SecurityException) {
            Log.e(TAG, "Security exception during subscribe", e)
            promise.reject("SECURITY_ERROR", "Bluetooth permission denied")
        }
    }

    /**
     * Unsubscribe from notifications
     */
    @ReactMethod
    fun unsubscribeFromNotifications(deviceId: String, promise: Promise) {
        Log.d(TAG, "Unsubscribing from notifications for device: $deviceId")
        
        val gatt = connectedDevices[deviceId]
        if (gatt == null) {
            promise.resolve(null)
            return
        }

        // Notifications will be disabled when we disconnect
        promise.resolve(null)
    }

    private fun enableNotification(gatt: BluetoothGatt, characteristic: BluetoothGattCharacteristic) {
        gatt.setCharacteristicNotification(characteristic, true)
        
        val descriptor = characteristic.getDescriptor(CCCD_UUID)
        if (descriptor != null) {
            descriptor.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
            gatt.writeDescriptor(descriptor)
        }
    }

    private fun checkPermissions(): Boolean {
        val context = reactContext
        
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            ContextCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_SCAN) == PackageManager.PERMISSION_GRANTED &&
            ContextCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED
        } else {
            ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        }
    }

    private val scanCallback = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, result: ScanResult?) {
            result?.device?.let { device ->
                val params = Arguments.createMap().apply {
                    putString("id", device.address)
                    putString("name", device.name ?: "Unknown")
                    putInt("rssi", result.rssi)
                }
                sendEvent("BleScanResult", params)
            }
        }

        override fun onScanFailed(errorCode: Int) {
            Log.e(TAG, "Scan failed with error code: $errorCode")
            isScanning = false
            sendEvent("BleError", Arguments.createMap().apply {
                putString("error", "Scan failed with error code: $errorCode")
            })
        }
    }

    private val gattCallback = object : BluetoothGattCallback() {
        override fun onConnectionStateChange(gatt: BluetoothGatt?, status: Int, newState: Int) {
            val deviceId = gatt?.device?.address ?: return
            
            when (newState) {
                BluetoothProfile.STATE_CONNECTED -> {
                    Log.d(TAG, "Connected to device: $deviceId")
                    connectedDevices[deviceId] = gatt
                    bluetoothGatt = gatt
                    
                    // Discover services
                    try {
                        gatt.discoverServices()
                    } catch (e: SecurityException) {
                        Log.e(TAG, "Security exception during service discovery", e)
                    }
                    
                    handler.post {
                        sendEvent("BleConnectionState", Arguments.createMap().apply {
                            putString("deviceId", deviceId)
                            putBoolean("connected", true)
                        })
                        
                        connectPromise?.resolve(true)
                        connectPromise = null
                    }
                }
                BluetoothProfile.STATE_DISCONNECTED -> {
                    Log.d(TAG, "Disconnected from device: $deviceId")
                    connectedDevices.remove(deviceId)
                    
                    handler.post {
                        sendEvent("BleConnectionState", Arguments.createMap().apply {
                            putString("deviceId", deviceId)
                            putBoolean("connected", false)
                        })
                        
                        connectPromise?.resolve(false)
                        connectPromise = null
                    }
                    
                    try {
                        gatt.close()
                    } catch (e: Exception) {
                        Log.e(TAG, "Error closing gatt", e)
                    }
                }
            }
        }

        override fun onServicesDiscovered(gatt: BluetoothGatt?, status: Int) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                Log.d(TAG, "Services discovered")
                gatt?.services?.forEach { service ->
                    Log.d(TAG, "Service: ${service.uuid}")
                }
            } else {
                Log.e(TAG, "Service discovery failed with status: $status")
            }
        }

        override fun onCharacteristicWrite(
            gatt: BluetoothGatt?,
            characteristic: BluetoothGattCharacteristic?,
            status: Int
        ) {
            handler.post {
                if (status == BluetoothGatt.GATT_SUCCESS) {
                    writePromise?.resolve(null)
                } else {
                    writePromise?.reject("WRITE_FAILED", "Write failed with status: $status")
                }
                writePromise = null
            }
        }

        override fun onCharacteristicChanged(
            gatt: BluetoothGatt?,
            characteristic: BluetoothGattCharacteristic?
        ) {
            characteristic?.let { char ->
                val value = String(char.value ?: byteArrayOf())
                Log.d(TAG, "Characteristic changed: ${char.uuid}, value: $value")
                
                handler.post {
                    try {
                        // Parse the notification data
                        val data = org.json.JSONObject(value)
                        val type = data.optString("type", "UNKNOWN")
                        
                        sendEvent("BleNotification", Arguments.createMap().apply {
                            putString("type", type)
                            putString("payload", value)
                        })
                    } catch (e: Exception) {
                        // If not JSON, send raw value
                        sendEvent("BleNotification", Arguments.createMap().apply {
                            putString("type", "RAW")
                            putString("payload", value)
                        })
                    }
                }
            }
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN's NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN's NativeEventEmitter
    }
}
