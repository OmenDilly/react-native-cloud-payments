import Foundation
import Cloudpayments
import NitroModules
import WebKit
import UIKit

// Import the provider protocol
import NitroModules

class HybridCloudPayments: HybridCloudPaymentsSpec {
    var publicId: String = ""
    // Store a reference to the 3DS delegate to access the results
    private var threeDsDelegate: CustomThreeDsDelegate?

    override init() {
        // Initialize the class
        super.init()
    }

    func initialize(publicId: String) throws -> Promise<Bool> {
        return Promise.async {
            self.publicId = publicId
            return true
        }
    }

    func generateCardCryptogram(params: CardCryptogramParams) throws -> Promise<String> {
        return Promise.async {
            // Using CloudPayments SDK to create a cryptogram
            guard let cryptogram = Card.makeCardCryptogramPacket(
                params.cardNumber,
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

    func isCardNumberValid(cardNumber: String) throws -> Promise<Bool> {
        return Promise.async {
            return Card.isCardNumberValid(cardNumber)
        }
    }

    func isExpDateValid(expDate: String) throws -> Promise<Bool> {
        return Promise.async {
            return Card.isExpDateValid(expDate)
        }
    }

    // 3DS Processing
    func show3ds(params: ThreeDsParams) throws -> Promise<ThreeDsResult> {
        let promise = Promise<ThreeDsResult>()
        DispatchQueue.main.async {
            // Create a delegate to handle 3DS authentication results
            let delegate = CustomThreeDsDelegate(
                onCompleted: { paRes, transactionId in
                    // Create ThreeDsResult object
                    let result = ThreeDsResult(
                        transactionId: transactionId,
                        paRes: paRes,
                        success: true
                    )
                    // Save result to the resolver
                    promise.resolve(withResult: result)
                },
                onFailed: { html in
                    // Create failed result
                    let error = NSError(domain: "CloudPayments", code: 6, userInfo: [
                        NSLocalizedDescriptionKey: "3DS Authentication failed"
                    ])
                    promise.reject(withError: error)
                },
                parentViewController: self.getCurrentViewController() ?? UIViewController()
            )
            self.threeDsDelegate = delegate

            // Get the top view controller to present the 3DS web view
            if let topVC = self.getCurrentViewController() {
                // Configure 3DS parameters
                let threeDsData = ThreeDsData(
                    transactionId: params.transactionId,
                    paReq: params.paReq,
                    acsUrl: params.acsUrl
                )

                // Show the 3DS authentication UI
                ThreeDsProcessor.process(
                    threeDsData: threeDsData,
                    delegate: delegate,
                    viewController: topVC
                )
            } else {
                // No view controller to present on
                let error = NSError(domain: "CloudPayments", code: 2, userInfo: [
                    NSLocalizedDescriptionKey: "Cannot present 3DS - no view controller available"
                ])
                promise.reject(withError: error)
            }
        }
        return promise
    }

    func finish3ds(transactionId: String) throws -> Promise<Bool> {
        return Promise.async {
            // Here you would typically finalize the 3DS process
            // For CloudPayments, this might involve sending a server request
            // But often this is handled by the server after receiving the PaRes
            return true
        }
    }

    // Direct payment
    func charge(params: ChargeParams) throws -> Promise<ChargeResult> {
        return Promise.async {
            // Check if we have a cryptogram or need to create one
            var cryptogram = params.cardCryptogram

            // If no cryptogram but we have card details, create one
            if cryptogram == nil && params.cardNumber != nil && params.expDate != nil && params.cvv != nil {
                guard let generatedCryptogram = Card.makeCardCryptogramPacket(
                    params.cardNumber!,
                    expDate: params.expDate!,
                    cvv: params.cvv!,
                    merchantPublicID: self.publicId
                ) else {
                    throw NSError(domain: "CloudPayments", code: 1, userInfo: [
                        NSLocalizedDescriptionKey: "Failed to create card cryptogram packet"
                    ])
                }

                cryptogram = generatedCryptogram
            }

            // Ensure we have a cryptogram
            guard let cryptogram = cryptogram else {
                throw NSError(domain: "CloudPayments", code: 3, userInfo: [
                    NSLocalizedDescriptionKey: "Missing cryptogram or card details"
                ])
            }

            // Create request data
            let url = URL(string: "https://api.cloudpayments.ru/payments/cards/charge")!
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")

            // Add authorization header with base64 encoded public ID
            // The correct format for CloudPayments API is "Basic {base64(publicId + ":")}"
            let authString = "\(self.publicId):"
            let authData = authString.data(using: .utf8)!
            let authBase64 = authData.base64EncodedString()
            request.setValue("Basic \(authBase64)", forHTTPHeaderField: "Authorization")

            // For debugging purpose
            print("CloudPayments - Authorization Header: Basic \(authBase64)")
            print("CloudPayments - Public ID being used: \(self.publicId)")

            // Prepare request body
            var requestBody: [String: Any] = [
                "Amount": params.amount,
                "Currency": params.currency,
                "IpAddress": "127.0.0.1", // Should be the real IP in production
                "Description": params.description,
                "CardCryptogramPacket": cryptogram
            ]

            // Add optional fields if provided
            if let accountId = params.accountId {
                requestBody["AccountId"] = accountId
            }

            if let email = params.email {
                requestBody["Email"] = email
            }

            // Debug: Print request parameters
            print("CloudPayments API Request to: \(url.absoluteString)")
            print("CloudPayments Request Body: \(requestBody)")

            // Convert body to JSON data
            let jsonData = try JSONSerialization.data(withJSONObject: requestBody)
            request.httpBody = jsonData

            // Make network request
            let (data, response) = try await URLSession.shared.data(for: request)

            // Check for a valid HTTP response
            guard let httpResponse = response as? HTTPURLResponse else {
                throw NSError(domain: "CloudPayments", code: 4, userInfo: [
                    NSLocalizedDescriptionKey: "Invalid HTTP response"
                ])
            }

            // Print HTTP status code for debugging
            print("CloudPayments - HTTP Status Code: \(httpResponse.statusCode)")

            // Try to convert response data to string for debugging
            if let responseString = String(data: data, encoding: .utf8) {
                print("CloudPayments - Raw Response: \(responseString)")
            }

            // Parse response
            guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
                throw NSError(domain: "CloudPayments", code: 5, userInfo: [
                    NSLocalizedDescriptionKey: "Failed to parse API response"
                ])
            }

            // Debug: Print the full JSON response
            print("CloudPayments API Response: \(json)")

            // Check if success
            let success = (json["Success"] as? Bool) ?? false

            // CloudPayments API can return data in different formats:
            // 1. Direct object in "Model"
            // 2. TransactionId at the root level
            // 3. Data inside different nested objects

            var transactionId = ""
            var statusEnum: ChargeStatus = .declined
            var reasonCode: Int? = nil
            var reasonMessage: String? = nil
            var paReq: String? = nil
            var acsUrl: String? = nil

            // Try to get data from Model
            if let model = json["Model"] as? [String: Any] {
                print("CloudPayments Model: \(model)")

                // Extract transaction ID from model
                if let id = model["TransactionId"] as? String, !id.isEmpty {
                    transactionId = id
                    print("CloudPayments - Extracted TransactionId from Model: \(transactionId)")
                } else if let id = model["TransactionId"] as? Int {
                    transactionId = String(id)
                    print("CloudPayments - Extracted numeric TransactionId from Model: \(transactionId)")
                }

                // Get reason code and message
                reasonCode = model["ReasonCode"] as? Int
                reasonMessage = model["CardHolderMessage"] as? String

                // Check for 3DS fields
                paReq = model["PaReq"] as? String
                acsUrl = model["AcsUrl"] as? String

                // Convert status string to ChargeStatus enum
                let status = model["Status"] as? String ?? ""
                if status == "Completed" {
                    statusEnum = .completed
                } else if status == "Authorized" {
                    statusEnum = .authorized
                } else if paReq != nil && acsUrl != nil {
                    statusEnum = .threeds
                }
            } else {
                // Try to get transaction ID directly from the response
                if let directTransactionId = json["TransactionId"] as? String, !directTransactionId.isEmpty {
                    transactionId = directTransactionId
                    print("CloudPayments - Using direct TransactionId: \(transactionId)")
                } else if let directTransactionId = json["TransactionId"] as? Int {
                    transactionId = String(directTransactionId)
                    print("CloudPayments - Using direct numeric TransactionId: \(transactionId)")
                }

                reasonMessage = json["Message"] as? String
            }

            // If still no transaction ID, look deeper
            if transactionId.isEmpty {
                // Try other locations where transactionId might be
                if let transaction = json["Transaction"] as? [String: Any] {
                    if let id = transaction["TransactionId"] as? String, !id.isEmpty {
                        transactionId = id
                        print("CloudPayments - Found TransactionId in Transaction object: \(transactionId)")
                    } else if let id = transaction["TransactionId"] as? Int {
                        transactionId = String(id)
                        print("CloudPayments - Found numeric TransactionId in Transaction object: \(transactionId)")
                    }
                }
            }

            let result = ChargeResult(
                transactionId: transactionId,
                status: statusEnum,
                reasonCode: reasonCode != nil ? Double(reasonCode!) : nil,
                reasonMessage: reasonMessage,
                paReq: paReq,
                acsUrl: acsUrl,
                success: success
            )

            // Debug the result
            print("CloudPayments - Final Result: success=\(success), transactionId=\(transactionId), status=\(statusEnum)")

            return result
        }
    }

    // Helper method to get the current view controller
    private func getCurrentViewController() -> UIViewController? {
        // Get connected scenes
        let scenes = UIApplication.shared.connectedScenes
        let windowScene = scenes.first as? UIWindowScene
        let window = windowScene?.windows.first { $0.isKeyWindow }

        return window?.rootViewController
    }

    // Add the missing topViewController function
    private func topViewController() -> UIViewController? {
        guard let rootViewController = getCurrentViewController() else {
            return nil
        }

        // Find the topmost presented view controller
        var topController = rootViewController
        while let presentedViewController = topController.presentedViewController {
            topController = presentedViewController
        }

        // If we have a navigation controller, get its visible view controller
        if let navigationController = topController as? UINavigationController {
            return navigationController.visibleViewController
        }

        // If we have a tab bar controller, get the selected view controller
        if let tabController = topController as? UITabBarController,
           let selectedViewController = tabController.selectedViewController {
            return selectedViewController
        }

        return topController
    }
}

// MARK: - CustomThreeDsDelegate

private class CustomThreeDsDelegate: NSObject, ThreeDsProcessorDelegate {
    private let onCompleted: (String, String) -> Void
    private let onFailed: (String) -> Void
    private var parentViewController: UIViewController
    private var webView: WebKit.WKWebView?

    init(onCompleted: @escaping (String, String) -> Void, onFailed: @escaping (String) -> Void, parentViewController: UIViewController) {
        self.onCompleted = onCompleted
        self.onFailed = onFailed
        self.parentViewController = parentViewController
        super.init()
    }

    func willPresentWebView(_ webView: WebKit.WKWebView) {
        print("CustomThreeDsDelegate - Will present WebView")
        self.webView = webView
    }

    func onAuthorizationCompleted(with paRes: String, transactionId: String) {
        print("CustomThreeDsDelegate - Authorization completed with paRes: \(paRes), transactionId: \(transactionId)")

        // Remove the webView if it's still in the view hierarchy
        DispatchQueue.main.async { [weak self] in
            self?.webView?.removeFromSuperview()
            self?.webView = nil
        }

        onCompleted(paRes, transactionId)
    }

    func onAuthorizationFailed(with html: String) {
        print("CustomThreeDsDelegate - Authorization failed with HTML: \(html)")

        // Remove the webView if it's still in the view hierarchy
        DispatchQueue.main.async { [weak self] in
            self?.webView?.removeFromSuperview()
            self?.webView = nil
        }

        onFailed(html)
    }
}
