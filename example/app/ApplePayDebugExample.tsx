import { CloudPaymentsModule } from '@omendilly/react-native-cloud-payments'
import React, { useState } from 'react'
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

export default function ApplePayDebugExample() {
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setDebugLogs((prev) => [...prev, `[${timestamp}] ${message}`])
  }

  const clearLogs = () => {
    setDebugLogs([])
  }

  const checkApplePayAvailability = async () => {
    addLog('Checking Apple Pay availability...')
    try {
      const isAvailable =
        await CloudPaymentsModule.isApplePayAvailableWithNetworks([
          'visa',
          'mastercard',
        ])
      addLog(`Apple Pay available: ${isAvailable}`)
      Alert.alert(
        'Apple Pay Availability',
        isAvailable
          ? 'Apple Pay is available with Visa/Mastercard on this device'
          : 'Apple Pay is not available with Visa/Mastercard on this device'
      )
    } catch (error) {
      addLog(`Error checking availability: ${error}`)
      Alert.alert('Error', `Failed to check Apple Pay availability: ${error}`)
    }
  }

  const handleApplePaySuccess = async (result: any) => {
    addLog('Apple Pay successful!')
    addLog(`Result: ${JSON.stringify(result, null, 2)}`)
    console.log('Apple Pay successful:', result)
    Alert.alert('Success', 'Apple Pay payment completed successfully!')
    setIsProcessing(false)
  }

  const handleApplePayError = (error: string) => {
    addLog(`Apple Pay error: ${error}`)
    console.error('Apple Pay error:', error)
    Alert.alert('Error', `Apple Pay payment failed: ${error}`)
    setIsProcessing(false)
  }

  const handleApplePayCancel = () => {
    addLog('Apple Pay cancelled by user')
    console.log('Apple Pay cancelled')
    Alert.alert('Cancelled', 'Apple Pay payment was cancelled')
    setIsProcessing(false)
  }

  const testWithValidMerchantId = () => {
    addLog('Testing with valid merchant ID...')
    // You should replace this with your actual merchant ID from Apple Developer account
    const validMerchantId = 'merchant.com.yourcompany.app' // Replace with your actual merchant ID
    addLog(`Using merchant ID: ${validMerchantId}`)
  }

  if (Platform.OS !== 'ios') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Apple Pay Debug Example</Text>
        <Text style={styles.subtitle}>
          Apple Pay is only available on iOS devices
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apple Pay Debug Example</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Debug Controls</Text>
        <Text style={styles.description}>
          Use these buttons to debug Apple Pay issues. Check the logs below for
          detailed information.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.debugButton, isProcessing && styles.disabled]}
            onPress={async () => {
              if (isProcessing) return
              setIsProcessing(true)
              addLog('Starting Apple Pay test payment...')

              try {
                const params = {
                  merchantId: 'merchant.com.example', // Your merchant ID
                  // merchantId: 'merchant.com.apple.test', // Apple's test merchant ID (for development)
                  amount: 100,
                  currency: 'RUB',
                  description: 'Debug test payment',
                  countryCode: 'RU',
                  supportedNetworks: ['visa', 'mastercard'],
                  merchantCapabilities: ['3ds'],
                }

                addLog(`Using merchant ID: ${params.merchantId}`)
                const result =
                  await CloudPaymentsModule.requestApplePayPayment(params)

                if (result.success) {
                  handleApplePaySuccess(result)
                } else {
                  handleApplePayError(result.error || 'Unknown error')
                }
              } catch (error) {
                handleApplePayError(
                  error instanceof Error ? error.message : 'Unknown error'
                )
              }
            }}
            disabled={isProcessing}
          >
            <Text style={styles.debugButtonText}>Test Apple Pay Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.debugButton, styles.checkButton]}
            onPress={checkApplePayAvailability}
          >
            <Text style={styles.debugButtonText}>
              Check Apple Pay Availability
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.logHeader}>
          <Text style={styles.sectionTitle}>Debug Logs</Text>
          <Text style={styles.clearButton} onPress={clearLogs}>
            Clear
          </Text>
        </View>
        <ScrollView style={styles.logContainer}>
          {debugLogs.map((log, index) => (
            <Text key={index} style={styles.logEntry}>
              {log}
            </Text>
          ))}
          {debugLogs.length === 0 && (
            <Text style={styles.noLogs}>
              No logs yet. Try the buttons above.
            </Text>
          )}
        </ScrollView>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Troubleshooting Guide</Text>
        <Text style={styles.infoText}>
          • The current merchant ID "merchant.com.example" is invalid{'\n'}• You
          need a real merchant ID from your Apple Developer account{'\n'}• Check
          the debug logs above for detailed error information{'\n'}• Make sure
          Apple Pay is set up on your device{'\n'}• Verify you have a valid
          payment method added{'\n'}• The merchant ID must match your Apple
          Developer account
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 10,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 10,
  },
  debugButton: {
    marginTop: 10,
    backgroundColor: '#FF6B6B',
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  checkButton: {
    backgroundColor: '#4ECDC4',
  },
  disabled: {
    opacity: 0.5,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clearButton: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  logContainer: {
    maxHeight: 200,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
  },
  logEntry: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  noLogs: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
})
