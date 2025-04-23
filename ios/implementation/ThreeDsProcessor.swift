//
//  ThreeDSDialog.swift
//  sdk
//
//  Created by Sergey Iskhakov on 09.09.2020.
//  Copyright © 2020 Cloudpayments. All rights reserved.
//

import Foundation
import WebKit
import UIKit

// Protocol for 3DS delegate to handle authentication events
public protocol ThreeDsProcessorDelegate: AnyObject  {
    func willPresentWebView(_ webView: WebKit.WKWebView)
    func onAuthorizationCompleted(with paRes: String, transactionId: String)
    func onAuthorizationFailed(with html: String)
}

// Data structure for 3DS authentication
public struct ThreeDsData {
    public let transactionId: String
    public let paReq: String
    public let acsUrl: String
}

// Class to handle 3DS authentication process
public class ThreeDsProcessor: NSObject {
    private static let POST_BACK_URL = "https://api.cloudpayments.ru/payments/get3dsData"
    private weak var delegate: ThreeDsProcessorDelegate?
    private var threeDsData: ThreeDsData
    private var webView: WebKit.WKWebView?
    private weak var viewController: UIViewController?
    private var navigationHandler: WebViewNavigationHandler?

    private init(threeDsData: ThreeDsData, delegate: ThreeDsProcessorDelegate, viewController: UIViewController) {
        self.threeDsData = threeDsData
        self.delegate = delegate
        self.viewController = viewController
        super.init()
    }

    // Static method to initiate 3DS process
    public static func process(threeDsData: ThreeDsData, delegate: ThreeDsProcessorDelegate, viewController: UIViewController) {
        let processor = ThreeDsProcessor(threeDsData: threeDsData, delegate: delegate, viewController: viewController)
        processor.make3DSPayment()
    }

    // Process 3DS payment
    private func make3DSPayment() {
        // Create web view configuration
        let webConfiguration = WebKit.WKWebViewConfiguration()
        let webView = WebKit.WKWebView(frame: .zero, configuration: webConfiguration)

        // Create navigation handler
        navigationHandler = WebViewNavigationHandler(processor: self)
        webView.navigationDelegate = navigationHandler
        webView.translatesAutoresizingMaskIntoConstraints = false

        // Inform delegate about presenting web view
        self.webView = webView
        delegate?.willPresentWebView(webView)

        // Add web view to view controller
        guard let viewController = viewController else {
            delegate?.onAuthorizationFailed(with: "No view controller available")
            return
        }

        // Add web view to view hierarchy
        viewController.view.addSubview(webView)

        // Setup constraints
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: viewController.view.safeAreaLayoutGuide.topAnchor),
            webView.leadingAnchor.constraint(equalTo: viewController.view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: viewController.view.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: viewController.view.safeAreaLayoutGuide.bottomAnchor)
        ])

        // Create the POST request for the ACS URL
        guard let url = URL(string: threeDsData.acsUrl) else {
            delegate?.onAuthorizationFailed(with: "Invalid ACS URL")
            return
        }

        let parameters = [
            "PaReq": threeDsData.paReq,
            "MD": threeDsData.transactionId,
            "TermUrl": "https://dummy.cloudpayments.ru/"
        ]

        // Create POST request body
        var bodyComponents = URLComponents()
        bodyComponents.queryItems = parameters.map { URLQueryItem(name: $0.key, value: $0.value) }
        let bodyString = bodyComponents.percentEncodedQuery ?? ""
        let bodyData = bodyString.data(using: .utf8)

        // Create request
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.httpBody = bodyData
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")

        // Load the request
        print("Loading 3DS authentication page from URL: \(threeDsData.acsUrl)")
        webView.load(request)
    }

    // MARK: - Navigation Handler

    // Handle navigation events
    fileprivate func handleDidFinishNavigation(webView: WebKit.WKWebView) {
        print("WebView didFinish navigation")

        // Check if this is the final redirect to the TermUrl
        if let url = webView.url?.absoluteString, url.hasPrefix("https://dummy.cloudpayments.ru/") {
            // Extract PaRes from the page content
            webView.evaluateJavaScript("document.documentElement.innerHTML") { [weak self] (html, error) in
                guard let self = self else { return }

                if let error = error {
                    print("Error evaluating JavaScript: \(error)")
                    self.delegate?.onAuthorizationFailed(with: "Error extracting authentication result: \(error)")
                    return
                }

                guard let htmlContent = html as? String else {
                    print("Failed to get HTML content")
                    self.delegate?.onAuthorizationFailed(with: "Failed to extract authentication result")
                    return
                }

                // Try to extract PaRes from HTML
                if let paResRange = htmlContent.range(of: "name=\"PaRes\" value=\""),
                   let endRange = htmlContent[paResRange.upperBound...].range(of: "\"") {
                    let paRes = String(htmlContent[paResRange.upperBound..<endRange.lowerBound])
                    self.delegate?.onAuthorizationCompleted(with: paRes, transactionId: self.threeDsData.transactionId)
                } else {
                    print("PaRes not found in HTML")
                    self.delegate?.onAuthorizationFailed(with: "Authentication result not found")
                }
            }
        }
    }

    fileprivate func handleDidFailNavigation(webView: WebKit.WKWebView, error: Error) {
        print("WebView didFail with error: \(error)")
        delegate?.onAuthorizationFailed(with: "Navigation failed: \(error.localizedDescription)")
    }

    fileprivate func handleDidFailProvisionalNavigation(webView: WebKit.WKWebView, error: Error) {
        print("WebView didFailProvisionalNavigation with error: \(error)")
        delegate?.onAuthorizationFailed(with: "Navigation failed: \(error.localizedDescription)")
    }
}

// Separate class to handle WKNavigationDelegate
private class WebViewNavigationHandler: NSObject, WKNavigationDelegate {
    private weak var processor: ThreeDsProcessor?

    init(processor: ThreeDsProcessor) {
        self.processor = processor
        super.init()
    }

    // WKNavigationDelegate methods
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        processor?.handleDidFinishNavigation(webView: webView)
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        processor?.handleDidFailNavigation(webView: webView, error: error)
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        processor?.handleDidFailProvisionalNavigation(webView: webView, error: error)
    }
}
