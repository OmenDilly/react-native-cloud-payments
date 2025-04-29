# ThreeDSecureView

A React Native component for handling 3D Secure authentication flows in payment processing. This component provides a standalone way to handle the 3DS verification process without requiring native code integration.

## Installation

This component requires `react-native-webview` as a peer dependency:

```bash
npm install react-native-webview
# or
yarn add react-native-webview
```

## Features

- Handles the complete 3D Secure authentication flow
- Automatically extracts the `MD` (transaction ID) and `PaRes` values from the 3DS response
- Works with various 3DS response formats (JSON, form fields, URL parameters)
- Customizable appearance and behavior
- Debug mode for troubleshooting

## Usage

```jsx
import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { ThreeDSecureView } from 'react-native-cloud-payments';

const PaymentScreen = () => {
  const [threeDsData, setThreeDsData] = useState(null);

  // This would come from your payment gateway / API
  const startPayment = () => {
    // Example data structure from a payment gateway that requires 3DS
    setThreeDsData({
      acsUrl: 'https://3ds-acs.somebank.com/verify',  // URL provided by payment processor
      transactionId: 'transaction-123456',            // Transaction ID (MD)
      paReq: 'SomePaReqValueFromPaymentGateway'       // PA Request from payment processor
    });
  };

  const handleComplete = (result) => {
    console.log('3DS authentication completed!', result);

    // result contains:
    // {
    //   md: "transaction-123456",    // Transaction ID
    //   paRes: "PaResResponseValue"  // PA Response from 3DS
    // }

    // Send these values back to your server/payment gateway to complete the payment
    completePayment(result.md, result.paRes);
  };

  const handleError = (error) => {
    console.error('3DS authentication failed:', error);
  };

  const handleClose = () => {
    setThreeDsData(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <Button title="Pay Now" onPress={startPayment} />

      {threeDsData && (
        <ThreeDSecureView
          threeDsData={threeDsData}
          termUrl="https://your-server.com/3ds-callback"
          onComplete={handleComplete}
          onError={handleError}
          onClose={handleClose}
          debug={__DEV__} // Enable debugging in development
        />
      )}
    </View>
  );
};
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `threeDsData` | Object | Yes | Data for 3DS authentication (`acsUrl`, `transactionId`, `paReq`) |
| `termUrl` | String | Yes | URL the 3DS system will redirect to (typically your server endpoint) |
| `onComplete` | Function | Yes | Callback when 3DS is complete - receives `{md, paRes}` |
| `onError` | Function | Yes | Callback when an error occurs |
| `onClose` | Function | Yes | Callback when the view is closed |
| `debug` | Boolean | No | Enable debug logging (default: false) |
| `showCloseButton` | Boolean | No | Show a close button (default: true) |
| `loadingText` | String | No | Text to show during initial loading (default: "Processing 3D Secure...") |
| `processingText` | String | No | Text to show during result processing (default: "Processing Result...") |
| `errorTitle` | String | No | Title for error display (default: "Error") |
| `renderCloseButton` | Function | No | Custom renderer for close button |
| `containerStyle` | Object | No | Additional styles for the container |
| `webViewStyle` | Object | No | Additional styles for the WebView |

## How It Works

1. The component displays a WebView with a form that auto-submits to the bank's 3DS authentication page (ACS URL)
2. The user completes the authentication on the bank's page
3. The bank redirects to your `termUrl` with the 3DS result
4. The component intercepts this redirect and extracts `MD` and `PaRes` values from the response
5. The extracted data is passed to your `onComplete` callback to complete the payment

## Notes on termUrl

The `termUrl` parameter is required by the 3DS protocol. It should typically be a URL to your server where you would process the 3DS result. However, this component uses advanced HTML parsing techniques to extract the result data directly within the app, eliminating the need for your server to process the 3DS result.

Your server endpoint at `termUrl` can be a simple page that displays the result in a way the component can parse. The extracted data will be passed to your `onComplete` callback.

## Advanced Usage

### Custom UI

```jsx
<ThreeDSecureView
  // ... required props
  containerStyle={{ borderRadius: 16, overflow: 'hidden' }}
  webViewStyle={{ backgroundColor: '#f9f9f9' }}
  loadingText="Verifying your payment..."
  processingText="Almost done..."
  renderCloseButton={() => (
    <TouchableOpacity style={styles.customCloseButton}>
      <Text>Cancel</Text>
    </TouchableOpacity>
  )}
/>
```

### Integration with Bottom Sheet

The component can be embedded within a bottom sheet or modal:

```jsx
import BottomSheet from '@gorhom/bottom-sheet';

const PaymentScreen = () => {
  const bottomSheetRef = useRef(null);

  // Open bottom sheet when starting 3DS
  const startPayment = () => {
    setThreeDsData({...});
    bottomSheetRef.current?.expand();
  };

  // Close bottom sheet when 3DS is done
  const handleClose = () => {
    setThreeDsData(null);
    bottomSheetRef.current?.close();
  };

  return (
    <View style={{ flex: 1 }}>
      <Button title="Pay Now" onPress={startPayment} />

      <BottomSheet ref={bottomSheetRef} snapPoints={['90%']}>
        {threeDsData && (
          <ThreeDSecureView
            threeDsData={threeDsData}
            termUrl="https://your-server.com/3ds-callback"
            onComplete={handleComplete}
            onError={handleError}
            onClose={handleClose}
          />
        )}
      </BottomSheet>
    </View>
  );
};
```

## Troubleshooting

Enable the `debug` prop to get verbose logging about the 3DS process and data extraction:

```jsx
<ThreeDSecureView
  // ... other props
  debug={true}
/>
```

This will log detailed information about each step of the 3DS process to the console.
