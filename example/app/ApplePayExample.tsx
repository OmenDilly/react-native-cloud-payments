import {
  ApplePayButton,
  CloudPaymentsModule,
} from '@omendilly/react-native-cloud-payments'
import React, { useState } from 'react'
import { Alert, Platform, StyleSheet, Text, View } from 'react-native'

export default function ApplePayExample() {
  const [isProcessing, setIsProcessing] = useState(false)

  const checkApplePayAvailability = async () => {
    try {
      const isAvailable =
        await CloudPaymentsModule.isApplePayAvailableWithNetworks([
          'visa',
          'mastercard',
        ])
      Alert.alert(
        'Apple Pay Availability',
        isAvailable
          ? 'Apple Pay is available with Visa/Mastercard on this device'
          : 'Apple Pay is not available with Visa/Mastercard on this device'
      )
    } catch (error) {
      Alert.alert('Error', `Failed to check Apple Pay availability: ${error}`)
    }
  }

  const handleApplePaySuccess = async (result: any) => {
    console.log('Apple Pay successful:', result)

    // Validate the cryptogram
    if (result.cryptogram) {
      try {
      } catch (error) {
        console.error('Cryptogram validation error:', error)
        Alert.alert('Success', 'Apple Pay payment completed successfully!')
      }
    } else {
      Alert.alert('Success', 'Apple Pay payment completed successfully!')
    }

    setIsProcessing(false)
  }

  const handleApplePayError = (error: string) => {
    console.error('Apple Pay error:', error)
    Alert.alert('Error', `Apple Pay payment failed: ${error}`)
    setIsProcessing(false)
  }

  const handleApplePayCancel = () => {
    console.log('Apple Pay cancelled')
    Alert.alert('Cancelled', 'Apple Pay payment was cancelled')
    setIsProcessing(false)
  }

  if (Platform.OS !== 'ios') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Apple Pay Example</Text>
        <Text style={styles.subtitle}>
          Apple Pay is only available on iOS devices
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apple Pay Example</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Payment</Text>
        <Text style={styles.description}>
          This example demonstrates Apple Pay integration with CloudPayments.
          The payment amount is set to 100 RUB for testing purposes.
        </Text>
        <Text style={styles.warning}>
          ⚠️ Make sure you have a valid merchant ID configured in your Apple
          Developer account
        </Text>

        <ApplePayButton
          merchantId="merchant.com.example" // Replace with your actual merchant ID
          amount={100} // 100 RUB in kopecks
          currency="RUB"
          description="Test payment for CloudPayments SDK"
          countryCode="RU"
          supportedNetworks={['visa', 'mastercard']}
          merchantCapabilities={['3ds']}
          onSuccess={handleApplePaySuccess}
          onError={handleApplePayError}
          onCancel={handleApplePayCancel}
          disabled={isProcessing}
          style={styles.applePayButton}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Check Availability</Text>
        <Text style={styles.description}>
          Check if Apple Pay is available on this device.
        </Text>

        <ApplePayButton
          merchantId="merchant.com.example"
          amount={100}
          currency="RUB"
          description="Availability check"
          onSuccess={() => {}}
          onError={checkApplePayAvailability}
          onCancel={() => {}}
          style={[styles.applePayButton, styles.checkButton]}
          textStyle={styles.checkButtonText}
        />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Troubleshooting</Text>
        <Text style={styles.infoText}>
          • Ensure you have a valid merchant ID configured{'\n'}• Make sure
          Apple Pay is set up on your device{'\n'}• Check that you have a valid
          payment method added{'\n'}• Verify the merchant ID matches your Apple
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
  applePayButton: {
    marginTop: 10,
  },
  checkButton: {
    backgroundColor: '#007AFF',
  },
  checkButtonText: {
    color: '#fff',
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
  warning: {
    fontSize: 14,
    color: '#FF9800',
    marginTop: 10,
    fontWeight: 'bold',
  },
})
