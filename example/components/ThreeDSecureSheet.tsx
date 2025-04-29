import { Ionicons } from '@expo/vector-icons'
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet'
import { Portal } from '@gorhom/portal'
import {
  ThreeDSecureView,
  type ThreeDsResult,
} from '@omendilly/react-native-cloud-payments'
import React, { useRef } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

// Define the expected structure for the 3DS data prop
interface ThreeDsData {
  acsUrl: string
  transactionId: string // Corresponds to MD in the Swift code
  paReq: string
}

// Define the props for the component
interface ThreeDSecureSheetProps {
  threeDsData: ThreeDsData | null // Data needed to initiate the 3DS process
  termUrl?: string // The URL the bank will redirect to (MUST be your server endpoint)
  onComplete?: (result: ThreeDsResult) => void // Callback for successful completion (passes result data from postMessage)
  onError?: (error: Error) => void // Callback for errors
  onClose?: () => void // Callback when the modal is manually closed or process finishes
}

const ThreeDSecureSheet: React.FC<ThreeDSecureSheetProps> = ({
  threeDsData,
  termUrl,
  onComplete,
  onError,
  onClose,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null)

  const handleCloseModal = () => {
    bottomSheetRef.current?.close()
    onClose?.()
  }

  const handleComplete = (result: ThreeDsResult) => {
    bottomSheetRef.current?.close()
    onComplete?.(result)
  }

  return (
    <Portal>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={['90%']}
        enablePanDownToClose={false}
        index={-1}
        backdropComponent={BottomSheetBackdrop}
        // enableHandlePanningGesture={false}
        handleComponent={null}
        style={styles.sheetContainer}
        onClose={handleCloseModal}
      >
        <BottomSheetView style={styles.container}>
          <View style={styles.closeButton}>
            <Pressable onPress={() => bottomSheetRef.current?.close()}>
              <Ionicons size={24} name="close" />
            </Pressable>
          </View>
          <ThreeDSecureView
            onClose={onClose}
            onOpen={() => bottomSheetRef.current?.expand()}
            onComplete={handleComplete}
            onError={onError}
            termUrl={termUrl}
            threeDsData={threeDsData}
            showCloseButton={false}
            debug
          />
        </BottomSheetView>
      </BottomSheet>
    </Portal>
  )
}

// Styles (no changes needed)
const styles = StyleSheet.create({
  sheetContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 16,
  },
  container: { flex: 1, backgroundColor: '#ffffff' },
  webView: { flex: 1, backgroundColor: 'transparent' },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 10,
  },
  loadingText: { marginTop: 15, fontSize: 16, color: '#333' },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 10,
  },
  errorTextTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
})

export default ThreeDSecureSheet
