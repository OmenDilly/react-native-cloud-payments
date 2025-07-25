import { PortalProvider } from '@gorhom/portal'
import { CloudPaymentsModule } from '@omendilly/react-native-cloud-payments'
import React, { useState } from 'react'
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
// import WebView from 'react-native-webview'

const App = () => {
  const [publicId, setPublicId] = useState(process.env.EXPO_PUBLIC_CP_PUBLIC_ID)
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242')
  const [expDate, setExpDate] = useState('12/25')
  const [cvv, setCvv] = useState('123')

  // Charge params
  const [amount, setAmount] = useState('1.00')
  const [currency, setCurrency] = useState('RUB')
  const [description, setDescription] = useState('Test payment')
  const [email, setEmail] = useState('')

  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const initialize = async () => {
    try {
      setLoading(true)
      const publicKeyData = await fetch(
        'https://api.cloudpayments.ru/payments/publickey'
      )
      const publicKey: { Pem: string; Version: number } =
        await publicKeyData.json()
      console.log('public key: ', publicKey)
      const success = await CloudPaymentsModule.initialize(
        publicId,
        publicKey.Pem,
        publicKey.Version
      )
      setInitialized(success)
      setResult(`Initialization ${success ? 'successful' : 'failed'}`)
    } catch (error: any) {
      Alert.alert('Initialization Error', error.message)
      setResult(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const generateCryptogram = async () => {
    if (!initialized) {
      Alert.alert('Error', 'Please initialize first')
      return
    }

    try {
      setLoading(true)
      const cryptogram = await CloudPaymentsModule.generateCardCryptogram({
        cardNumber,
        expDate,
        cvv,
      })
      setResult(`Generated cryptogram: ${cryptogram}`)
    } catch (error: any) {
      Alert.alert('Cryptogram Error', error.message)
      setResult(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <GestureHandlerRootView style={styles.gestureHandlerRott}>
      <PortalProvider>
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>CloudPayments Demo</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Public ID:</Text>
              <TextInput
                style={styles.input}
                value={publicId}
                onChangeText={setPublicId}
                placeholder="Your CloudPayments Public ID"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Card Number:</Text>
              <TextInput
                style={styles.input}
                value={cardNumber}
                onChangeText={setCardNumber}
                placeholder="4111 1111 1111 1111"
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer]}>
                <Text style={styles.label}>Expiration (MM/YY):</Text>
                <TextInput
                  style={styles.input}
                  value={expDate}
                  onChangeText={setExpDate}
                  placeholder="12/25"
                />
              </View>

              <View style={[styles.inputContainer]}>
                <Text style={styles.label}>CVV:</Text>
                <TextInput
                  style={styles.input}
                  value={cvv}
                  onChangeText={setCvv}
                  placeholder="123"
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={4}
                />
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, initialized && styles.buttonSuccess]}
                onPress={initialize}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {initialized ? 'Re-Initialize' : 'Initialize SDK'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={generateCryptogram}
                disabled={loading || !initialized}
              >
                <Text style={styles.buttonText}>Generate Cryptogram</Text>
              </TouchableOpacity>
            </View>

            {/* Direct Charge Section */}
            {/* <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Direct Payment</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Amount:</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="1.00"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Currency:</Text>
                <TextInput
                  style={styles.input}
                  value={currency}
                  onChangeText={setCurrency}
                  placeholder="RUB"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Description:</Text>
                <TextInput
                  style={styles.input}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Test payment"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email (optional):</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="customer@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {loading && (
              <ActivityIndicator
                size="large"
                color="#0066cc"
                style={styles.loader}
              />
            )} */}
          </ScrollView>

          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Result:</Text>
            <Text style={styles.resultText} numberOfLines={10}>
              {result}
            </Text>
          </View>
        </SafeAreaView>
      </PortalProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  gestureHandlerRott: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
    flex: 1,
    marginRight: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#0066cc',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonSuccess: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginVertical: 20,
  },
  resultContainer: {
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
})

export default App
