# Apple Pay Integration

This document describes how to use Apple Pay with the React Native Cloud Payments library.

## Prerequisites

1. **Apple Developer Account**: You need an Apple Developer account to configure Apple Pay
2. **Merchant ID**: Create a Merchant ID in your Apple Developer account
3. **Payment Processing Certificate**: Configure payment processing certificates
4. **iOS Device**: Apple Pay only works on iOS devices with Apple Pay capability

## Setup

### 1. Configure Apple Pay in your iOS app

Add the following to your `Info.plist`:

```xml
<key>PKPaymentNetworks</key>
<array>
    <string>visa</string>
    <string>mastercard</string>
    <string>amex</string>
</array>
```

### 2. Add Apple Pay capability

In Xcode, go to your target's "Signing & Capabilities" tab and add the "Apple Pay" capability.

## Usage

### Using the ApplePayButton Component

The easiest way to implement Apple Pay is using the provided `ApplePayButton` component:

```tsx
import { ApplePayButton } from 'react-native-cloud-payments'

const PaymentScreen = () => {
  const handleApplePaySuccess = (result) => {
    console.log('Apple Pay successful:', result.cryptogram)
    // Use the cryptogram to complete the payment with CloudPayments API
  }

  const handleApplePayError = (error) => {
    console.error('Apple Pay error:', error)
  }

  const handleApplePayCancel = () => {
    console.log('Apple Pay cancelled')
  }

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
  )
}
```

### Using the Module Directly

You can also use the module directly for more control:

```tsx
import { CloudPaymentsModule } from 'react-native-cloud-payments'

const requestApplePay = async () => {
  try {
    // Check if Apple Pay is available
    const isAvailable = await CloudPaymentsModule.isApplePayAvailable()

    if (!isAvailable) {
      console.log('Apple Pay is not available')
      return
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
    })

    if (result.success) {
      console.log('Payment successful:', result.cryptogram)
      // Use the cryptogram with CloudPayments API
    } else {
      console.error('Payment failed:', result.error)
    }
  } catch (error) {
    console.error('Apple Pay error:', error)
  }
}
```

## Parameters

### ApplePayParams

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `merchantId` | string | Yes | Your Apple Pay merchant identifier |
| `amount` | number | Yes | Payment amount in smallest currency unit |
| `currency` | string | Yes | Currency code (e.g., "RUB", "USD") |
| `description` | string | Yes | Payment description |
| `countryCode` | string | No | Country code (default: "RU") |
| `supportedNetworks` | string[] | No | Supported payment networks (default: ["visa", "mastercard"]) |
| `merchantCapabilities` | string[] | No | Merchant capabilities (default: ["3ds"]) |

### Supported Networks

- `visa`
- `mastercard`
- `amex`
- `discover`
- `maestro`
- `chinaunionpay`
- `eftpos`
- `electron`
- `elo`
- `interac`
- `mada`
- `privatelabel`
- `quicpay`
- `suica`
- `vpay`
- `barcode`
- `girocard`
- `nanaco`
- `waon`
- `idcredit`
- `jcb`

### Merchant Capabilities

- `3ds` - 3D Secure support
- `emv` - EMV support
- `credit` - Credit card support
- `debit` - Debit card support

## ApplePayResult

The Apple Pay result contains:

```typescript
interface ApplePayResult {
  success: boolean
  cryptogram?: string  // The payment cryptogram for CloudPayments API
  error?: string       // Error message if payment failed
}
```

## Using the Cryptogram

After a successful Apple Pay payment, you'll receive a cryptogram that can be used with the CloudPayments API:

```tsx
const handleApplePaySuccess = async (result: ApplePayResult) => {
  if (result.success && result.cryptogram) {
    // Use the cryptogram with CloudPayments API
    const chargeResult = await CloudPaymentsModule.charge({
      amount: 1000,
      currency: 'RUB',
      description: 'Payment for goods',
      cardCryptogram: result.cryptogram,
    })

    if (chargeResult.success) {
      console.log('Payment completed successfully')
    } else {
      console.error('Payment failed:', chargeResult.reasonMessage)
    }
  }
}
```

## Platform Support

- **iOS**: Full Apple Pay support
- **Android**: Returns error indicating Apple Pay is not available

## Error Handling

Common error scenarios:

1. **Apple Pay not available**: Device doesn't support Apple Pay or user hasn't set it up
2. **Payment cancelled**: User cancelled the payment
3. **Invalid merchant ID**: Incorrect merchant identifier
4. **Network issues**: Connection problems during payment processing

## Best Practices

1. **Always check availability**: Use `isApplePayAvailable()` before showing Apple Pay options
2. **Handle cancellation**: Provide appropriate UI feedback when users cancel payments
3. **Test thoroughly**: Test on real devices with Apple Pay configured
4. **Follow Apple guidelines**: Ensure your implementation follows Apple's Human Interface Guidelines
5. **Secure handling**: Never log or store sensitive payment data

## Troubleshooting

### Apple Pay not showing
- Ensure Apple Pay is configured in your Apple Developer account
- Check that the device supports Apple Pay
- Verify the merchant ID is correct
- Ensure the app has the Apple Pay capability

### Payment fails
- Check that the amount and currency are valid
- Verify the merchant capabilities match your Apple Pay configuration
- Ensure the device has a valid payment method added to Apple Pay

### Cryptogram conversion fails
- This is handled automatically by the SDK
- If it fails, the payment will be marked as unsuccessful
- Check that the PKPayment extension is properly included in the iOS SDK
