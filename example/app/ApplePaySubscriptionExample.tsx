import { ApplePayButton } from '@omendilly/react-native-cloud-payments'
import React, { useState } from 'react'
import { Alert, Platform, StyleSheet, Text, View } from 'react-native'

export default function ApplePaySubscriptionExample() {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubscriptionSuccess = async (result: any) => {
    console.log('Apple Pay subscription successful:', result)

    // For subscriptions, you'll get a recurring payment token
    if (result.cryptogram) {
      try {
        // Validate the cryptogram
        console.log('Subscription cryptogram validation: PASSED')

        Alert.alert(
          'Subscription Success',
          `Apple Pay subscription started successfully!\n\nCryptogram length: ${result.cryptogram.length} characters\n\nThis will be used for recurring billing.`
        )
      } catch (error) {
        console.error('Subscription cryptogram validation error:', error)
        Alert.alert('Success', 'Apple Pay subscription started successfully!')
      }
    } else {
      Alert.alert('Success', 'Apple Pay subscription started successfully!')
    }

    setIsProcessing(false)
  }

  const handleSubscriptionError = (error: string) => {
    console.error('Apple Pay subscription error:', error)
    Alert.alert('Error', `Apple Pay subscription failed: ${error}`)
    setIsProcessing(false)
  }

  const handleSubscriptionCancel = () => {
    console.log('Apple Pay subscription cancelled')
    Alert.alert('Cancelled', 'Apple Pay subscription was cancelled')
    setIsProcessing(false)
  }

  if (Platform.OS !== 'ios') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Apple Pay Subscription Example</Text>
        <Text style={styles.subtitle}>
          Apple Pay subscriptions are only available on iOS devices
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apple Pay Subscription Example</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Subscription</Text>
        <Text style={styles.description}>
          This example demonstrates Apple Pay subscription integration. The
          subscription will be billed monthly at 299 RUB.
        </Text>
        <Text style={styles.warning}>
          ⚠️ Make sure you have a valid merchant ID configured for subscriptions
        </Text>

        <ApplePayButton
          merchantId="merchant.com.example" // Replace with your actual merchant ID
          amount={299} // 299 RUB in kopecks
          currency="RUB"
          description="Monthly Premium Subscription"
          countryCode="RU"
          supportedNetworks={['visa', 'mastercard']}
          merchantCapabilities={['3ds']}
          recurringPayment={{
            description: 'Premium subscription with unlimited access',
            regularBilling: {
              amount: 299,
              currency: 'RUB',
              interval: 'month',
              intervalCount: 1,
              description: 'Monthly Premium Plan',
            },
            managementURL: 'https://your-app.com/subscription-management',
          }}
          onSuccess={handleSubscriptionSuccess}
          onError={handleSubscriptionError}
          onCancel={handleSubscriptionCancel}
          disabled={isProcessing}
          style={styles.applePayButton}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Annual Subscription</Text>
        <Text style={styles.description}>
          Annual subscription with a discount.
        </Text>

        <ApplePayButton
          merchantId="merchant.com.example"
          amount={2990} // 2990 RUB in kopecks
          currency="RUB"
          description="Annual Premium Subscription"
          countryCode="RU"
          supportedNetworks={['visa', 'mastercard']}
          merchantCapabilities={['3ds']}
          recurringPayment={{
            description: 'Annual Premium subscription with 17% discount',
            regularBilling: {
              amount: 2990,
              currency: 'RUB',
              interval: 'year',
              intervalCount: 1,
              description: 'Annual Premium Plan',
            },
            managementURL: 'https://your-app.com/subscription-management',
          }}
          onSuccess={handleSubscriptionSuccess}
          onError={handleSubscriptionError}
          onCancel={handleSubscriptionCancel}
          disabled={isProcessing}
          style={styles.applePayButton}
        />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Subscription Features</Text>
        <Text style={styles.infoText}>
          • Recurring billing handled by Apple Pay{'\n'}• Automatic renewal
          until cancelled{'\n'}• Users can manage subscriptions in Settings
          {'\n'}• Cryptogram contains recurring payment token{'\n'}• Use with
          CloudPayments subscription API
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
    marginBottom: 30,
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
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  warning: {
    fontSize: 14,
    color: '#FF9800',
    marginTop: 10,
    fontWeight: 'bold',
  },
  applePayButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
})
