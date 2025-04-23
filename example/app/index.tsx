import {
  CloudPaymentsModule,
  ThreeDsParams,
} from '@omendilly/react-native-cloud-payments'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

const App = () => {
  const [publicId, setPublicId] = useState('pk_68af42d685b66be4ea9ae09ce23e4')
  const [cardNumber, setCardNumber] = useState('4111111111111111')
  const [expDate, setExpDate] = useState('12/25')
  const [cvv, setCvv] = useState('123')

  // 3DS params
  const [transactionId, setTransactionId] = useState('')
  const [paReq, setPaReq] = useState('')
  const [acsUrl, setAcsUrl] = useState('')

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
      const success = await CloudPaymentsModule.initialize(publicId)
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

  const validateCardNumber = async () => {
    try {
      setLoading(true)
      const isValid = await CloudPaymentsModule.isCardNumberValid(cardNumber)
      setResult(`Card number is ${isValid ? 'valid' : 'invalid'}`)
    } catch (error: any) {
      Alert.alert('Validation Error', error.message)
      setResult(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const validateExpDate = async () => {
    try {
      setLoading(true)
      const isValid = await CloudPaymentsModule.isExpDateValid(expDate)
      setResult(`Expiration date is ${isValid ? 'valid' : 'invalid'}`)
    } catch (error: any) {
      Alert.alert('Validation Error', error.message)
      setResult(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Process 3DS authentication
  const process3ds = async (params: ThreeDsParams) => {
    if (!initialized) {
      Alert.alert('Error', 'Please initialize first')
      return
    }

    if (!params.transactionId || !params.paReq || !params.acsUrl) {
      Alert.alert('Error', 'Please fill all the fields')
      return
    }

    try {
      console.log('process3ds: ', params)
      setLoading(true)
      const threeDsResult = await CloudPaymentsModule.show3ds(params)
      setResult(
        `3DS Result:\nTransaction ID: ${threeDsResult.transactionId}\nSuccess: ${
          threeDsResult.success ? 'Yes' : 'No'
        }\nPaRes: ${threeDsResult.paRes.substring(0, 30)}...`
      )

      console.log('3ds result: ', threeDsResult)

      // Optionally finish the 3DS process
      if (threeDsResult.success) {
        const finishResult = await CloudPaymentsModule.finish3ds(
          threeDsResult.transactionId
        )
        setResult(
          (prev) =>
            `${prev}\n\nFinish 3DS: ${finishResult ? 'Success' : 'Failed'}`
        )
      }
    } catch (error: any) {
      Alert.alert('3DS Error', error.message)
      setResult(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Make a direct charge
  const makeCharge = async () => {
    if (!initialized) {
      Alert.alert('Error', 'Please initialize first')
      return
    }

    try {
      setLoading(true)
      const chargeResult = await CloudPaymentsModule.charge({
        amount: parseFloat(amount),
        currency,
        description,
        email: email || undefined,
        cardNumber,
        expDate,
        cvv,
      })

      console.log('transaction result: ', JSON.stringify(chargeResult))

      setResult(
        `Charge Result:\nTransaction ID: ${chargeResult.transactionId}\nStatus: ${
          chargeResult.status
        }\nSuccess: ${chargeResult.success ? 'Yes' : 'No'}`
      )

      if (chargeResult.reasonMessage) {
        setResult((prev) => `${prev}\nMessage: ${chargeResult.reasonMessage}`)
      }

      // If 3DS is required, we'll show the 3DS dialog
      if (
        chargeResult.status === 'ThreeDS' &&
        !!chargeResult.paReq &&
        !!chargeResult.acsUrl
      ) {
        // Auto-fill 3DS fields
        setTransactionId(chargeResult.transactionId)
        setPaReq(chargeResult.paReq)
        setAcsUrl(chargeResult.acsUrl)

        Alert.alert(
          '3DS Authentication Required',
          'This payment requires 3DS authentication. The 3DS fields have been filled automatically.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Proceed to 3DS',
              onPress: () =>
                process3ds({
                  acsUrl: chargeResult.acsUrl,
                  paReq: chargeResult.paReq,
                  transactionId: chargeResult.transactionId,
                }),
            },
          ]
        )
      }
    } catch (error: any) {
      Alert.alert('Charge Error', error.message)
      setResult(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
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
          <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Expiration (MM/YY):</Text>
            <TextInput
              style={styles.input}
              value={expDate}
              onChangeText={setExpDate}
              placeholder="12/25"
            />
          </View>

          <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
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

          <TouchableOpacity
            style={styles.button}
            onPress={validateCardNumber}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Validate Card Number</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={validateExpDate}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Validate Exp Date</Text>
          </TouchableOpacity>
        </View>

        {/* 3DS Processing Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>3DS Processing</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Transaction ID:</Text>
            <TextInput
              style={styles.input}
              value={transactionId}
              onChangeText={setTransactionId}
              placeholder="Transaction ID"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>paReq:</Text>
            <TextInput
              style={styles.input}
              value={paReq}
              onChangeText={setPaReq}
              placeholder="paReq value"
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>ACS URL:</Text>
            <TextInput
              style={styles.input}
              value={acsUrl}
              onChangeText={setAcsUrl}
              placeholder="https://acs.example.com"
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={process3ds}
            disabled={loading || !initialized}
          >
            <Text style={styles.buttonText}>Process 3DS</Text>
          </TouchableOpacity>
        </View>

        {/* Direct Charge Section */}
        <View style={styles.sectionContainer}>
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

          <TouchableOpacity
            style={styles.button}
            onPress={makeCharge}
            disabled={loading || !initialized}
          >
            <Text style={styles.buttonText}>Make Payment</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <ActivityIndicator
            size="large"
            color="#0066cc"
            style={styles.loader}
          />
        )}
      </ScrollView>

      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Result:</Text>
        <Text style={styles.resultText} numberOfLines={10}>
          {result}
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
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
