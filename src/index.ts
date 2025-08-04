import { NitroModules } from 'react-native-nitro-modules'
import type {
  ApplePayParams,
  ApplePayResult,
  CardCryptogramParams,
  ChargeParams,
  ChargeResult,
  ChargeStatus,
  CloudPayments,
  ThreeDsParams,
  ThreeDsResult,
} from './specs/CloudPayments.nitro'

// Export UI components
export { default as ThreeDSecureView } from './ui/components/ThreeDSecureView'
export type {
  ThreeDsData,
  ThreeDSecureViewProps,
} from './ui/components/ThreeDSecureView'

export { default as ApplePayButton } from './ui/components/ApplePayButton'
export type { ApplePayButtonProps } from './ui/components/ApplePayButton'

// Export types
export type {
  ApplePayParams,
  ApplePayResult,
  CardCryptogramParams,
  ChargeParams,
  ChargeResult,
  ChargeStatus,
  CloudPayments,
  ThreeDsParams,
  ThreeDsResult,
}

// Create and export the CloudPayments module
export const CloudPaymentsModule =
  NitroModules.createHybridObject<CloudPayments>('CloudPayments')
