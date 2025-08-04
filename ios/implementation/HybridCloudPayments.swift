import Foundation
import Cloudpayments
import NitroModules
import WebKit
import UIKit
import PassKit

// Import the provider protocol
import NitroModules

class HybridCloudPayments: HybridCloudPaymentsSpec {
    var publicId: String = ""
    var publicKey: String = ""
    var keyVersion: Double = 0

    // Add a strong reference to retain the delegate
    private var currentApplePayDelegate: ApplePayDelegate?

    override init() {
        // Initialize the class
        super.init()
    }

    func initialize(publicId: String, publicKey: String, keyVersion: Double) throws -> Promise<Bool> {
        return Promise.async {
            self.publicId = publicId
            self.publicKey = publicKey
            self.keyVersion = keyVersion
            return true
        }
    }

    func generateCardCryptogram(params: CardCryptogramParams) throws -> Promise<String> {
        return Promise.async {
            // Using CloudPayments SDK to create a cryptogram
            guard let cryptogram = Card.makeCardCryptogramPacket(
                with: params.cardNumber,
                expDate: params.expDate,
                cvv: params.cvv,
                merchantPublicID: self.publicId
            ) else {
                throw NSError(domain: "CloudPayments", code: 1, userInfo: [
                    NSLocalizedDescriptionKey: "Failed to create card cryptogram packet"
                ])
            }

            return cryptogram
        }
    }

    func isApplePayAvailable() throws -> Promise<Bool> {
        return Promise.async {
            return await PKPaymentAuthorizationViewController.canMakePayments()
        }
    }

    func isApplePayAvailableWithNetworks(networks: [String]?) throws -> Promise<Bool> {
        return Promise.async {
            let paymentNetworks = self.parseSupportedNetworks(networks)
            return await PKPaymentAuthorizationViewController.canMakePayments(usingNetworks: paymentNetworks)
        }
    }

    func requestApplePayPayment(params: ApplePayParams) throws -> Promise<ApplePayResult> {
        return Promise.async { [weak self] in
            guard let self = self else {
                throw NSError(domain: "CloudPayments", code: 2, userInfo: [
                    NSLocalizedDescriptionKey: "Self reference lost"
                ])
            }

            // Check if Apple Pay is available
            guard await PKPaymentAuthorizationViewController.canMakePayments() else {
                return ApplePayResult(success: false, cryptogram: nil, error: "Apple Pay is not available on this device")
            }

            // Create payment request (regular or recurring based on params)
            let request = PKPaymentRequest()
            request.merchantIdentifier = params.merchantId
            request.supportedNetworks = self.parseSupportedNetworks(params.supportedNetworks)
            request.merchantCapabilities = self.parseMerchantCapabilities(params.merchantCapabilities)
            request.countryCode = params.countryCode ?? "RU"
            request.currencyCode = params.currency

                        // Handle recurring payments for subscriptions
            // TODO: Add subscription support in future version

            // Create payment summary items
            let paymentItem = PKPaymentSummaryItem(
                label: params.description,
                amount: NSDecimalNumber(value: params.amount)
            )
            request.paymentSummaryItems = [paymentItem]

            // Create and present Apple Pay controller
            guard let applePayController = await PKPaymentAuthorizationViewController(paymentRequest: request) else {
                return ApplePayResult(success: false, cryptogram: nil, error: "Failed to create Apple Pay controller")
            }

            // Create delegate with proper completion handling
            let delegate = ApplePayDelegate { [weak self] result in
                // Clear the strong reference after completion
                self?.currentApplePayDelegate = nil
                return result
            }

            // Retain the delegate as a strong reference
            self.currentApplePayDelegate = delegate

            await MainActor.run {
                applePayController.delegate = delegate
                applePayController.modalPresentationStyle = .formSheet
            }

            // Get the top view controller to present from
            guard let topViewController = self.getTopViewController() else {
                return ApplePayResult(success: false, cryptogram: nil, error: "No view controller available to present Apple Pay")
            }

            await topViewController.present(applePayController, animated: true)

            // Wait for the delegate to complete using async/await
            return await delegate.waitForCompletion()
        }
    }

    private func parseSupportedNetworks(_ networks: [String]?) -> [PKPaymentNetwork] {
        let defaultNetworks: [PKPaymentNetwork] = [.visa, .masterCard]
        guard let networks = networks else { return defaultNetworks }

        return networks.compactMap { network in
            switch network.lowercased() {
            case "visa": return .visa
            case "mastercard": return .masterCard
            case "amex": return .amex
            case "discover": return .discover
            case "maestro": return .maestro
            case "chinaunionpay": return .chinaUnionPay
            case "eftpos": return .eftpos
            case "electron": return .electron
            case "elo": return .elo
            case "interac": return .interac
            case "mada": return .mada
            case "privatelabel": return .privateLabel
            case "quicpay": return .quicPay
            case "suica": return .suica
            case "vpay": return .vPay
            case "barcode": return .barcode
            case "girocard": return .girocard
            case "nanaco": return .nanaco
            case "waon": return .waon
            case "idcredit": return .idCredit
            default: return nil
            }
        }
    }

    private func parseMerchantCapabilities(_ capabilities: [String]?) -> PKMerchantCapability {
        let defaultCapabilities: PKMerchantCapability = .capability3DS
        guard let capabilities = capabilities else { return defaultCapabilities }

        var result: PKMerchantCapability = []

        for capability in capabilities {
            switch capability.lowercased() {
            case "3ds": result.insert(.capability3DS)
            case "emv": result.insert(.capabilityEMV)
            case "credit": result.insert(.capabilityCredit)
            case "debit": result.insert(.capabilityDebit)
            default: break
            }
        }

        return result.isEmpty ? defaultCapabilities : result
    }

    // TODO: Add billing interval parsing for subscription support

    private func getTopViewController() -> UIViewController? {
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = windowScene.windows.first else {
            return nil
        }

        var topViewController = window.rootViewController
        while let presentedViewController = topViewController?.presentedViewController {
            topViewController = presentedViewController
        }

        return topViewController
    }
}

// Apple Pay Delegate
class ApplePayDelegate: NSObject, PKPaymentAuthorizationViewControllerDelegate {
    private let completion: (ApplePayResult) -> ApplePayResult
    private var isCompleted = false
    var result: ApplePayResult = ApplePayResult(success: false, cryptogram: nil, error: "Payment not completed")

    init(completion: @escaping (ApplePayResult) -> ApplePayResult) {
        self.completion = completion
        super.init()
    }

    func waitForCompletion() async -> ApplePayResult {
        while isCompleted == false {
            do {
                try await Task.sleep(nanoseconds: 100_000_000) // 0.1 second
            } catch {
                print("CloudPayments: Error in waitForCompletion: \(error)")
                break
            }
        }
        return result
    }

    func paymentAuthorizationViewController(_ controller: PKPaymentAuthorizationViewController, didAuthorizePayment payment: PKPayment, completion: @escaping (PKPaymentAuthorizationStatus) -> Void) {
        print("CloudPayments: Apple Pay payment authorized")

        // Convert PKPayment to cryptogram string (as per point 5 in documentation)
        guard let cryptogram = payment.convertToString() else {
            print("CloudPayments: Failed to convert payment to cryptogram")
            result = ApplePayResult(success: false, cryptogram: nil, error: "Failed to convert payment to cryptogram")
            completion(.failure)
            return
        }

        // Validate cryptogram format
        guard !cryptogram.isEmpty else {
            print("CloudPayments: Cryptogram is empty")
            result = ApplePayResult(success: false, cryptogram: nil, error: "Generated cryptogram is empty")
            completion(.failure)
            return
        }

        print("CloudPayments: RAW Cryptogram: \(cryptogram)")

        // Validate cryptogram JSON structure
        guard let cryptogramData = cryptogram.data(using: .utf8),
              let cryptogramJson = try? JSONSerialization.jsonObject(with: cryptogramData) as? [String: Any],
              cryptogramJson["transactionIdentifier"] != nil,
              cryptogramJson["paymentMethod"] != nil else {
            print("CloudPayments: Cryptogram has invalid JSON structure")
            result = ApplePayResult(success: false, cryptogram: nil, error: "Generated cryptogram has invalid format")
            completion(.failure)
            return
        }

        print("CloudPayments: Payment converted to cryptogram successfully")
        print("CloudPayments: Cryptogram length: \(cryptogram.count) characters")

        // Log first 50 characters of cryptogram for debugging (without exposing sensitive data)
        let preview = String(cryptogram.prefix(50))
        print("CloudPayments: Cryptogram preview: \(preview)...")

        result = ApplePayResult(success: true, cryptogram: cryptogram, error: nil)
        completion(.success)
        isCompleted = true
    }

    func paymentAuthorizationViewControllerDidFinish(_ controller: PKPaymentAuthorizationViewController) {
        print("CloudPayments: Apple Pay controller did finish")

        // Handle cancellation or completion
        if result.success == false && result.error == "Payment not completed" {
            print("CloudPayments: Payment was cancelled by user")
            result = ApplePayResult(success: false, cryptogram: nil, error: "Payment was cancelled")
        }

        // Mark as completed
        isCompleted = true

        // Let the system handle the dismissal
        controller.dismiss(animated: true)
    }
}
