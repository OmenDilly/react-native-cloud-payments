import { NitroModules } from 'react-native-nitro-modules'
import type {
  CardCryptogramParams,
  ChargeParams,
  ChargeResult,
  ChargeStatus,
  CloudPayments,
  ThreeDsParams,
  ThreeDsResult,
} from './specs/CloudPayments.nitro'

// Export types
export type {
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
