import React, { useCallback } from 'react'
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native'
import {
  type ApplePayParams,
  type ApplePayResult,
  CloudPaymentsModule,
} from '../../index'
import type { StringHolder } from '../../specs/CloudPayments.nitro'

export interface ApplePayButtonProps {
  merchantId: string
  amount: number
  currency: string
  description: string
  countryCode?: string
  supportedNetworks?: StringHolder[]
  merchantCapabilities?: StringHolder[]
  onSuccess?: (result: ApplePayResult) => void
  onError?: (error: string) => void
  onCancel?: () => void
  style?: any
  textStyle?: any
  disabled?: boolean
}

const ApplePayButton: React.FC<ApplePayButtonProps> = ({
  merchantId,
  amount,
  currency,
  description,
  countryCode = 'RU',
  supportedNetworks = [{ value: 'visa' }, { value: 'mastercard' }],
  merchantCapabilities = [{ value: '3ds' }],
  onSuccess,
  onError,
  onCancel,
  style,
  textStyle,
  disabled = false,
}) => {
  const handleApplePayPress = useCallback(async () => {
    try {
      // Check if Apple Pay is available with the specified networks
      const isAvailable =
        await CloudPaymentsModule.isApplePayAvailableWithNetworks(
          supportedNetworks
        )

      if (!isAvailable) {
        onError?.(
          'Apple Pay is not available with the specified payment networks on this device'
        )
        return
      }

      // Prepare Apple Pay parameters
      const params: ApplePayParams = {
        merchantId,
        amount,
        currency,
        description,
        countryCode,
        supportedNetworks,
        merchantCapabilities,
      }

      // Request Apple Pay payment
      const result = await CloudPaymentsModule.requestApplePayPayment(params)

      if (result.success) {
        onSuccess?.(result)
      } else {
        if (
          result.error?.includes('cancelled') ||
          result.error?.includes('Payment was cancelled')
        ) {
          onCancel?.()
        } else {
          onError?.(result.error || 'Apple Pay payment failed')
        }
      }
    } catch (error) {
      onError?.(
        error instanceof Error ? error.message : 'Apple Pay payment failed'
      )
    }
  }, [
    merchantId,
    amount,
    currency,
    description,
    countryCode,
    supportedNetworks,
    merchantCapabilities,
    onSuccess,
    onError,
    onCancel,
  ])

  // Don't render on Android
  if (Platform.OS !== 'ios') {
    return null
  }

  return (
    <TouchableOpacity
      style={[styles.button, style, disabled && styles.disabled]}
      onPress={handleApplePayPress}
      disabled={disabled}
    >
      <Text style={[styles.text, textStyle]}>Pay with Apple Pay</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
})

export default ApplePayButton
