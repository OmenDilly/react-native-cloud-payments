import type { HybridObject } from 'react-native-nitro-modules'

export type ChargeStatus = 'Completed' | 'Authorized' | 'Declined' | 'ThreeDS'

export interface CloudPayments
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  initialize(
    publicId: string,
    publicKey: string,
    keyVersion: string
  ): Promise<boolean>
  generateCardCryptogram(params: CardCryptogramParams): Promise<string>
  isCardNumberValid(cardNumber: string): Promise<boolean>
  isExpDateValid(expDate: string): Promise<boolean>

  // 3DS Processing
  show3ds(params: ThreeDsParams): Promise<ThreeDsResult>
  finish3ds(transactionId: string): Promise<boolean>

  // Direct payment
  charge(params: ChargeParams): Promise<ChargeResult>
}

export interface CardCryptogramParams {
  cardNumber: string
  expDate: string
  cvv: string
}

export interface ThreeDsParams {
  transactionId: string
  paReq: string
  acsUrl: string
}

export interface ThreeDsResult {
  transactionId: string
  paRes: string
  success: boolean
}

export interface ChargeParams {
  amount: number
  currency: string
  description: string
  accountId?: string
  email?: string
  cardCryptogram?: string
  cardNumber?: string
  expDate?: string
  cvv?: string
}

export interface ChargeResult {
  transactionId: string
  status: ChargeStatus
  reasonCode?: number
  reasonMessage?: string
  paReq?: string
  acsUrl?: string
  success: boolean
}
