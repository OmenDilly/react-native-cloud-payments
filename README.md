# react-native-cloud-payments

A React Native wrapper for CloudPayments SDK that allows you to generate cryptograms for card payments and process Apple Pay payments.

## Installation

```sh
npm install react-native-cloud-payments
```

### iOS setup

Add the CloudPayments SDK to your Podfile:

```ruby
pod 'Cloudpayments', :git => 'https://github.com/cloudpayments/CloudPayments-SDK-iOS', :tag => '1.1.9'
pod 'CloudpaymentsNetworking', :git => 'https://github.com/cloudpayments/CloudPayments-SDK-iOS', :tag => '1.1.9'
```

Then run:

```sh
cd ios && pod install
```

#### Apple Pay Setup (iOS only)

To enable Apple Pay, you need to:

1. **Add Apple Pay capability** in Xcode:
   - Open your project in Xcode
   - Select your target
   - Go to "Signing & Capabilities"
   - Click "+" and add "Apple Pay"

2. **Configure your Info.plist**:
   ```xml
   <key>PKPaymentNetworks</key>
   <array>
       <string>visa</string>
       <string>mastercard</string>
       <string>amex</string>
   </array>
   ```

3. **Set up Apple Pay in your Apple Developer account**:
   - Create a Merchant ID
   - Configure payment processing certificates
   - Add the Merchant ID to your app's capabilities

### Android setup

In your project-level build.gradle, ensure you have the jitpack repository:

```gradle
allprojects {
    repositories {
        // ... other repositories
        maven { url 'https://jitpack.io' }
    }
}
```

For Yandex Pay support (optional), add your Yandex Client ID to your app-level build.gradle:

```gradle
android {
    // ...
    defaultConfig {
       // ...
       manifestPlaceholders = [
               YANDEX_CLIENT_ID: "your-yandex-client-id" // or empty string if not used
       ]
    }
}
```

## Development

To set up the development environment, clone this repo and run:

```sh
yarn
```

To regenerate the native bindings after modifying TypeScript specs, run:

```sh
npx nitro-codegen
```

### Setting Up the Example App

```sh
cd example
yarn
```

To run the example app with Metro:

```sh
yarn start
```

Then, in another terminal:

```sh
# For iOS
yarn ios

# For Android
yarn android
```

Make sure to replace the public ID in the example app with your own CloudPayments public ID.

### Notes

This module uses Nitro, a high-performance framework for building native modules for React Native. The native implementation is written in Swift for iOS and Kotlin for Android, with a statically generated type-safe binding layer.

## Usage

### Basic Card Payment

```javascript
import { CloudPaymentsModule } from 'react-native-cloud-payments';

// Initialize module with your public ID
await CloudPaymentsModule.initialize('your_public_id');

// Generate a cryptogram for card payment
const cryptogram = await CloudPaymentsModule.generateCardCryptogram({
  cardNumber: '4111111111111111',
  expDate: '12/25',
  cvv: '123',
});

console.log('Generated cryptogram:', cryptogram);

// Validate card number
const isValid = await CloudPaymentsModule.isCardNumberValid('4111111111111111');
console.log('Card number is valid:', isValid);

// Validate expiration date
const isValidDate = await CloudPaymentsModule.isExpDateValid('12/25');
console.log('Expiration date is valid:', isValidDate);
```

### Apple Pay Integration

Apple Pay is available on iOS devices and provides a secure, convenient way to process payments.

#### Using the ApplePayButton Component

```javascript
import { ApplePayButton } from 'react-native-cloud-payments';

const PaymentScreen = () => {
  const handleApplePaySuccess = (result) => {
    console.log('Apple Pay successful:', result.cryptogram);
    // Use the cryptogram to complete the payment with CloudPayments API
  };

  const handleApplePayError = (error) => {
    console.error('Apple Pay error:', error);
  };

  const handleApplePayCancel = () => {
    console.log('Apple Pay cancelled');
  };

  return (
    <ApplePayButton
      merchantId="merchant.com.yourdomain"
      amount={1000} // Amount in smallest currency unit (e.g., cents)
      currency="RUB"
      description="Payment for goods"
      countryCode="RU"
      supportedNetworks={['visa', 'mastercard']}
      merchantCapabilities={['3ds']}
      onSuccess={handleApplePaySuccess}
      onError={handleApplePayError}
      onCancel={handleApplePayCancel}
    />
  );
};
```

#### Using the Module Directly

```javascript
import { CloudPaymentsModule } from 'react-native-cloud-payments';

const requestApplePay = async () => {
  try {
    // Check if Apple Pay is available
    const isAvailable = await CloudPaymentsModule.isApplePayAvailable();

    if (!isAvailable) {
      console.log('Apple Pay is not available');
      return;
    }

    // Request Apple Pay payment
    const result = await CloudPaymentsModule.requestApplePayPayment({
      merchantId: 'merchant.com.yourdomain',
      amount: 1000,
      currency: 'RUB',
      description: 'Payment for goods',
      countryCode: 'RU',
      supportedNetworks: ['visa', 'mastercard'],
      merchantCapabilities: ['3ds'],
    });

    if (result.success) {
      console.log('Payment successful:', result.cryptogram);
      // Use the cryptogram with CloudPayments API
    } else {
      console.error('Payment failed:', result.error);
    }
  } catch (error) {
    console.error('Apple Pay error:', error);
  }
};
```

### 3D Secure Authentication

When processing payments, you may need to handle 3D Secure (3DS) authentication as required by many banks. This module provides native implementation for 3DS processing:

1. After attempting a payment using a cryptogram, your server may receive a 3DS response from CloudPayments
2. Pass the 3DS parameters (transactionId, paReq, acsUrl) to your React Native app
3. Call the `show3ds` method to show the 3DS authentication dialog to the user
4. The method returns a Promise that resolves when the authentication is complete with result information
5. Use the PaRes value in the result to complete the payment process through your server

```javascript
// Process 3D Secure (3DS) authentication
const threeDsResult = await CloudPaymentsModule.show3ds({
  transactionId: 'your-transaction-id', // Transaction ID from CloudPayments
  paReq: 'your-pareq-value',            // PaReq value from CloudPayments
  acsUrl: 'https://acs.example.com',    // ACS URL from CloudPayments
});

console.log('3DS authentication successful:', threeDsResult.success);
console.log('3DS transaction ID:', threeDsResult.transactionId);
console.log('3DS PaRes:', threeDsResult.paRes);

// Optionally finish the 3DS process (if needed by your implementation)
if (threeDsResult.success) {
  const finishResult = await CloudPaymentsModule.finish3ds(threeDsResult.transactionId);
  console.log('3DS finalization successful:', finishResult);
}
```

## Use with your server

After generating the cryptogram (from either card payment or Apple Pay), you should send it to your server which will make a request to the CloudPayments API to process the payment. Do not use CloudPayments API keys directly in your app.

## Apple Pay Documentation

For detailed Apple Pay integration information, see [APPLE_PAY.md](APPLE_PAY.md).

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
