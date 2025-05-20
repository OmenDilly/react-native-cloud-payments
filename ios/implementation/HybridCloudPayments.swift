import Foundation
import Cloudpayments
import NitroModules
import WebKit
import UIKit

// Import the provider protocol
import NitroModules

class HybridCloudPayments: HybridCloudPaymentsSpec {
    var publicId: String = ""
    var publicKey: String = ""
    var keyVersion: Double = 0

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
                cardNumber: params.cardNumber,
                expDate: params.expDate,
                cvv: params.cvv,
                merchantPublicID: self.publicId,
                publicKey: self.publicKey,
                keyVersion: Int(self.keyVersion)
            ) else {
                throw NSError(domain: "CloudPayments", code: 1, userInfo: [
                    NSLocalizedDescriptionKey: "Failed to create card cryptogram packet"
                ])
            }

            return cryptogram
        }
    }
}
