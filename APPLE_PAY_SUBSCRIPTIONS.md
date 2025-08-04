# Apple Pay Subscriptions

This document describes how to implement Apple Pay subscriptions with the React Native Cloud Payments library.

## Overview

Apple Pay subscriptions use **recurring payment requests** instead of one-time payments. This allows for automatic billing cycles and subscription management.

## Key Differences from One-Time Payments

| Feature | One-Time Payment | Subscription |
|---------|------------------|--------------|
| **Request Type** | `PKPaymentRequest` | `PKPaymentRequest` + `PKRecurringPaymentRequest` |
| **Billing** | Single charge | Recurring automatic billing |
| **User Management** | No user action needed | Users can manage in Settings |
| **Cryptogram** | One-time payment token | Recurring payment token |
| **CloudPayments API** | `charge()` or `auth()` | Subscription-specific endpoints |

## Setup Requirements

### 1. Apple Developer Account Configuration

For subscriptions, you need additional setup in your Apple Developer account:

1. **Merchant ID**: Same as one-time payments
2. **Payment Processing Certificate**: Same as one-time payments
3. **Recurring Payment Agreement**: Must be approved by Apple
4. **Subscription Capability**: Enable in your app's capabilities

### 2. App Configuration

Add subscription capability to your `Info.plist`:

```xml
<key>PKPaymentNetworks</key>
<array>
    <string>visa</string>
    <string>mastercard</string>
</array>
<key>PKRecurringPaymentAgreement</key>
<true/>
```

## Implementation

### Basic Subscription Example

```tsx
import { ApplePayButton } from 'react-native-cloud-payments'

const SubscriptionScreen = () => {
  const handleSubscriptionSuccess = (result) => {
    console.log('Subscription successful:', result.cryptogram)
    // Use the cryptogram with CloudPayments subscription API
  }

  return (
    <ApplePayButton
      merchantId="merchant.com.yourdomain"
      amount={299} // 299 RUB in kopecks
      currency="RUB"
      description="Monthly Premium Subscription"
      countryCode="RU"
      supportedNetworks={['visa', 'mastercard']}
      merchantCapabilities={['3ds']}
      recurringPayment={{
        description: "Premium subscription with unlimited access",
        regularBilling: {
          amount: 299,
          currency: "RUB",
          interval: "month",
          intervalCount: 1,
          description: "Monthly Premium Plan"
        },
        managementURL: "https://your-app.com/subscription-management"
      }}
      onSuccess={handleSubscriptionSuccess}
      onError={handleSubscriptionError}
      onCancel={handleSubscriptionCancel}
    />
  )
}
```

### Advanced Subscription with Multiple Intervals

```tsx
// Monthly subscription
const monthlySubscription = {
  description: "Monthly Premium Plan",
  regularBilling: {
    amount: 299,
    currency: "RUB",
    interval: "month",
    intervalCount: 1,
    description: "Monthly Premium Plan"
  },
  managementURL: "https://your-app.com/subscription-management"
}

// Annual subscription with discount
const annualSubscription = {
  description: "Annual Premium Plan (Save 17%)",
  regularBilling: {
    amount: 2990,
    currency: "RUB",
    interval: "year",
    intervalCount: 1,
    description: "Annual Premium Plan"
  },
  managementURL: "https://your-app.com/subscription-management"
}

// Weekly subscription
const weeklySubscription = {
  description: "Weekly Basic Plan",
  regularBilling: {
    amount: 99,
    currency: "RUB",
    interval: "week",
    intervalCount: 1,
    description: "Weekly Basic Plan"
  },
  managementURL: "https://your-app.com/subscription-management"
}
```

## Parameters

### RecurringPaymentParams

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `description` | string | Yes | Description of the subscription |
| `regularBilling` | RegularBillingParams | Yes | Billing configuration |
| `managementURL` | string | Yes | URL where users can manage subscriptions |

### RegularBillingParams

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `amount` | number | Yes | Billing amount in smallest currency unit |
| `currency` | string | Yes | Currency code (e.g., "RUB", "USD") |
| `interval` | BillingInterval | Yes | Billing interval |
| `intervalCount` | number | Yes | Number of intervals |
| `description` | string | Yes | Description of the billing plan |

### Supported Billing Intervals

- `day` - Daily billing
- `week` - Weekly billing
- `month` - Monthly billing
- `year` - Annual billing

## CloudPayments Integration

### Using the Cryptogram

After a successful subscription payment, you'll receive a cryptogram that contains a recurring payment token:

```tsx
const handleSubscriptionSuccess = async (result: ApplePayResult) => {
  if (result.success && result.cryptogram) {
    // Use the cryptogram with CloudPayments subscription API
    const subscriptionResult = await CloudPaymentsModule.createSubscription({
      amount: 299,
      currency: 'RUB',
      description: 'Monthly Premium Subscription',
      cardCryptogram: result.cryptogram,
      recurringPayment: {
        interval: 'month',
        intervalCount: 1
      }
    })

    if (subscriptionResult.success) {
      console.log('Subscription created successfully')
    } else {
      console.error('Subscription failed:', subscriptionResult.reasonMessage)
    }
  }
}
```

## Subscription Management

### User Management

Users can manage their subscriptions in iOS Settings:

1. **Settings** → **Apple ID** → **Subscriptions**
2. Users can view, modify, or cancel subscriptions
3. Changes are automatically reflected in your app

### App Management

Your app should handle subscription status:

```tsx
// Check subscription status
const checkSubscriptionStatus = async () => {
  try {
    const status = await CloudPaymentsModule.getSubscriptionStatus()
    console.log('Subscription status:', status)
  } catch (error) {
    console.error('Error checking subscription:', error)
  }
}

// Cancel subscription
const cancelSubscription = async () => {
  try {
    const result = await CloudPaymentsModule.cancelSubscription()
    console.log('Subscription cancelled:', result)
  } catch (error) {
    console.error('Error cancelling subscription:', error)
  }
}
```

## Best Practices

### 1. Clear Communication

- Always clearly describe what the subscription includes
- Show the billing interval prominently
- Provide a management URL for users

### 2. Testing

- Test with Apple's sandbox environment
- Use test cards for subscription testing
- Verify recurring billing works correctly

### 3. Error Handling

```tsx
const handleSubscriptionError = (error: string) => {
  if (error.includes('cancelled')) {
    // User cancelled the subscription
    console.log('User cancelled subscription')
  } else if (error.includes('network')) {
    // Network or payment method issue
    console.log('Payment method not available')
  } else {
    // Other error
    console.error('Subscription error:', error)
  }
}
```

### 4. Compliance

- Follow Apple's subscription guidelines
- Provide clear terms and conditions
- Handle subscription lifecycle properly

## Troubleshooting

### Common Issues

1. **"Recurring payment not supported"**
   - Ensure your merchant ID supports recurring payments
   - Check that recurring payment agreement is approved

2. **"Invalid billing interval"**
   - Verify the interval is one of: day, week, month, year
   - Check that intervalCount is a positive number

3. **"Management URL required"**
   - Provide a valid HTTPS URL for subscription management
   - URL must be accessible to users

### Testing Checklist

- [ ] Test with different billing intervals
- [ ] Verify cryptogram generation
- [ ] Test subscription cancellation
- [ ] Check management URL accessibility
- [ ] Validate error handling
- [ ] Test with different payment methods

## Platform Support

- **iOS**: Full subscription support
- **Android**: Returns error indicating Apple Pay is not available

## Security Considerations

1. **Never store sensitive payment data**
2. **Use HTTPS for management URLs**
3. **Validate cryptograms server-side**
4. **Handle subscription lifecycle securely**
5. **Follow PCI DSS guidelines**

## Integration with CloudPayments API

The cryptogram from Apple Pay subscriptions should be used with CloudPayments subscription endpoints:

```tsx
// Example CloudPayments subscription API call
const createSubscription = async (cryptogram: string) => {
  const response = await fetch('https://api.cloudpayments.ru/subscriptions/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(publicId + ':')}`
    },
    body: JSON.stringify({
      amount: 299,
      currency: 'RUB',
      description: 'Monthly Premium Subscription',
      cardCryptogram: cryptogram,
      recurringPayment: {
        interval: 'month',
        intervalCount: 1
      }
    })
  })

  return response.json()
}
```

This implementation provides a complete Apple Pay subscription solution that integrates seamlessly with CloudPayments.
