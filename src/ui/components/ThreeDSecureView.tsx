import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import {
  WebView,
  type WebViewMessageEvent,
  type WebViewNavigation,
} from 'react-native-webview'
import type { ThreeDsResult } from '../../specs/CloudPayments.nitro'

// Define the expected structure for the 3DS data prop
export interface ThreeDsData {
  acsUrl: string
  transactionId: string // Corresponds to MD in the Swift code
  paReq: string
}

// Define the props for the component
export interface ThreeDSecureViewProps {
  threeDsData: ThreeDsData | null // Data needed to initiate the 3DS process
  termUrl?: string // The URL the bank will redirect to (MUST be your server endpoint)
  onComplete?: (result: ThreeDsResult) => void // Callback for successful completion (passes result data from postMessage)
  onError?: (error: Error) => void // Callback for errors
  onClose?: () => void // Callback when the modal is manually closed or process finishes
  onOpen?: () => void // Callback when the modal is manually opened or process starts
  onLoadStart?: () => void // Callback when the modal is manually opened or process starts
  onLoadEnd?: () => void // Callback when the modal is manually opened or process starts
  debug?: boolean // Debug flag to enable verbose logging

  // Optional UI customization props
  showCloseButton?: boolean
  loadingText?: string
  processingText?: string
  errorTitle?: string
  renderCloseButton?: () => React.ReactNode
  containerStyle?: StyleProp<ViewStyle>
  webViewStyle?: StyleProp<ViewStyle>
}

// Define a possible structure for the message from your server's termUrl page
interface PostMessageData {
  type: '3dsResult' | 'log' | 'htmlContent'
  status?: 'success' | 'failure' | 'error'
  data?: any // e.g., PaRes, MD, or processed transaction details
  error?: string // Error message if status is 'error' or 'failure'
  content?: string // HTML content for 'htmlContent' type
  level?: string // Log level for 'log' type
  message?: string // Message for 'log' type
  formData?: Record<string, string>
  urlParams?: Record<string, string>
  bodyText?: string
}

const ThreeDSecureView: React.FC<ThreeDSecureViewProps> = ({
  threeDsData,
  termUrl = 'https://api.cloudpayments.ru/payments/get3dsData',
  onComplete,
  onError,
  onClose,
  onOpen,
  onLoadStart,
  onLoadEnd,
  debug = false,
  showCloseButton = true,
  loadingText = 'Processing 3D Secure...',
  processingText = 'Processing Result...',
  errorTitle = 'Error',
  renderCloseButton,
  containerStyle,
  webViewStyle,
}) => {
  const [webViewSource, setWebViewSource] = useState<{ html: string } | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)
  const [errorState, setErrorState] = useState<string | null>(null)
  const [isTermUrlReached, setIsTermUrlReached] = useState(false) // Track if termUrl was hit
  const webViewRef = useRef<WebView>(null)

  // Prepare HTML form for auto-POST
  const prepareAndShow3DSForm = useCallback(
    (data: ThreeDsData) => {
      onLoadStart?.()
      setIsLoading(true)
      setErrorState(null)
      setWebViewSource(null)
      setIsTermUrlReached(false) // Reset flag

      if (debug) {
        console.log('Preparing 3DS form POST to:', data.acsUrl)
        console.log('TermUrl set to (should be your server endpoint):', termUrl)
      }

      const formHtml = `
      <!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{display:flex;justify-content:center;align-items:center;height:100vh;margin:0;font-family:sans-serif;background-color:#f0f0f0;}.loader{border:5px solid #f3f3f3;border-top:5px solid #3498db;border-radius:50%;width:50px;height:50px;animation:spin 1s linear infinite;}@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style></head><body><div class="loader"></div><form id="redirectForm" action="${data.acsUrl}" method="POST"><input type="hidden" name="MD" value="${data.transactionId}" /><input type="hidden" name="PaReq" value="${data.paReq}" /><input type="hidden" name="TermUrl" value="${termUrl}" /></form><script>window.onload=function(){try{document.getElementById('redirectForm').submit();if(window.ReactNativeWebView&&window.ReactNativeWebView.postMessage){window.ReactNativeWebView.postMessage(JSON.stringify({type:'log',level:'info',message:'Auto-submitting 3DS form'}));}}catch(e){if(window.ReactNativeWebView&&window.ReactNativeWebView.postMessage){window.ReactNativeWebView.postMessage(JSON.stringify({type:'log',level:'error',message:'Error submitting form: '+e.message}));}}};</script></body></html>
    `

      setWebViewSource({ html: formHtml })
      onOpen?.()
    },
    [termUrl, debug, onOpen, onLoadStart]
  )

  // Effect to prepare the 3DS HTML when data is provided
  useEffect(() => {
    if (threeDsData) {
      prepareAndShow3DSForm(threeDsData)
    } else {
      // Reset state if data is cleared
      setWebViewSource(null)
      setIsLoading(false)
      setErrorState(null)
      setIsTermUrlReached(false) // Reset flag
      onLoadEnd?.()
    }
  }, [threeDsData, prepareAndShow3DSForm, onLoadEnd])

  // Handle navigation state changes
  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    const { url, loading } = navState
    if (debug) {
      console.log(`WebView Nav State Change: URL=${url}, Loading=${loading}`)
    }

    if (!loading && isLoading && url !== 'about:blank') {
      setIsLoading(false)
    }

    // Detect navigation TO the termUrl - this might happen multiple times in redirects
    if (url && url.startsWith(termUrl)) {
      if (debug) {
        console.log('TermUrl or redirect detected:', url)
      }
      // Only set the flag if not already set
      if (!isTermUrlReached) {
        setIsTermUrlReached(true)
      }

      // If the page has finished loading, inject the script to extract HTML
      if (!loading) {
        if (debug) {
          console.log(
            'Page finished loading at termUrl, injecting HTML extraction script'
          )
        }
        injectHtmlExtractScript()
      }
    }
  }

  // Function to inject JavaScript that extracts HTML content
  const injectHtmlExtractScript = () => {
    if (webViewRef.current) {
      const extractHtmlScript = `
        (function() {
          try {
            // Send the full HTML for inspection in debug mode
            const html = document.documentElement.outerHTML.toString();

            // For form pages, we need to check form data
            const formData = {};
            document.querySelectorAll('form input').forEach(input => {
              if (input.name && input.value) {
                formData[input.name] = input.value;
              }
            });

            // Check the URL and page content for query params
            const urlParams = {};
            if (window.location.search) {
              const searchParams = new URLSearchParams(window.location.search);
              for (const [key, value] of searchParams.entries()) {
                urlParams[key] = value;
              }
            }

            // Check page content for visible text with MD and PaRes patterns
            const bodyText = document.body.innerText || document.body.textContent || '';

            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'htmlContent',
              content: html,
              formData: formData,
              urlParams: urlParams,
              bodyText: bodyText
            }));
          } catch(e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'log',
              level: 'error',
              message: 'Error extracting HTML: ' + e.message
            }));
          }
          true;
        })();
      `

      webViewRef.current.injectJavaScript(extractHtmlScript)
    }
  }

  // Function to handle errors within the WebView loading process
  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent
    console.error('WebView Load Error: ', nativeEvent)
    if (!errorState) {
      const errorDescription = `WebView Error: ${nativeEvent.description} (URL: ${nativeEvent.url}, Code: ${nativeEvent.code}, Domain: ${nativeEvent.domain})`
      setErrorState(errorDescription)
      onError?.(new Error(errorDescription))
    }
    setIsLoading(false)
  }

  // Handle WebView load end event
  const handleLoadEnd = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent
    if (debug) {
      console.log(
        'WebView Load End:',
        nativeEvent.url,
        'Success:',
        !nativeEvent.loading
      )
    }

    // If we've reached termUrl and the page finished loading, inject the script
    if (isTermUrlReached && !nativeEvent.loading && !nativeEvent.description) {
      injectHtmlExtractScript()
    }

    // Hide loading indicator if it wasn't an error page and we haven't reached termUrl yet
    if (
      isLoading &&
      !nativeEvent.loading &&
      !nativeEvent.description &&
      !isTermUrlReached
    ) {
      setIsLoading(false)
    }
    if (nativeEvent.description && !errorState) {
      handleWebViewError(syntheticEvent)
    }
  }

  // Parse HTML content to extract 3DS data
  const extractDataFromHtml = (htmlData: {
    content: string
    formData?: Record<string, string>
    urlParams?: Record<string, string>
    bodyText?: string
  }) => {
    const { content: htmlContent, formData, urlParams, bodyText } = htmlData

    if (debug) {
      console.log('HTML Content Length:', htmlContent.length)
      console.log('Form Data:', JSON.stringify(formData))
      console.log('URL Params:', JSON.stringify(urlParams))
      console.log('Body Text Length:', bodyText?.length || 0)
    }

    try {
      // First check direct form data if available (most reliable)
      if (formData && Object.keys(formData).length > 0) {
        if (formData.MD && formData.PaRes) {
          if (debug) console.log('✅ Found data in form fields')
          return {
            transactionId: formData.MD,
            paRes: formData.PaRes,
            success: true,
          }
        }
      }

      // Check URL parameters
      if (urlParams && Object.keys(urlParams).length > 0) {
        if (urlParams.MD && urlParams.PaRes) {
          if (debug) console.log('✅ Found data in URL parameters')
          return {
            transactionId: urlParams.MD,
            paRes: urlParams.PaRes,
            success: true,
          }
        }
      }

      // Method 1: Look for JSON object using braces approach
      let jsonData = null
      try {
        // Try to extract JSON object from the HTML
        // We need to be more careful here as this content could be massive
        // and contain multiple JSON objects

        let processedStr = htmlContent

        // Scan for patterns that look like our expected data
        const jsonPattern = /\{"MD":"[^"]+","PaRes":"[^"]+"\}/
        const match = processedStr.match(jsonPattern)

        if (match && match[0]) {
          const potentialJson = match[0]
          try {
            const parsedData = JSON.parse(potentialJson)
            if (parsedData.MD && parsedData.PaRes) {
              if (debug)
                console.log('✅ Found data using JSON pattern matching')
              jsonData = {
                transactionId: parsedData.MD,
                paRes: parsedData.PaRes,
                success: true,
              }
            }
          } catch (e) {
            if (debug) console.log('JSON pattern matching parse failed:', e)
          }
        } else {
          // Fall back to the original method
          const startIndex = processedStr.indexOf('{')
          if (startIndex !== -1) {
            const endIndex = processedStr.lastIndexOf('}')
            if (endIndex !== -1 && endIndex > startIndex) {
              try {
                // Extract the JSON string
                processedStr = processedStr.substring(startIndex, endIndex + 1)

                // Try to parse it
                const parsedData = JSON.parse(processedStr)

                // Check if it contains the expected fields
                if (parsedData.MD && parsedData.PaRes) {
                  if (debug)
                    console.log('✅ Found data using JSON object method')
                  jsonData = {
                    transactionId: parsedData.MD,
                    paRes: parsedData.PaRes,
                    success: true,
                  }
                }
              } catch (e) {
                if (debug) console.log('Full JSON extraction failed:', e)
              }
            }
          }
        }
      } catch (error: any) {
        if (debug)
          console.log('⚠️ JSON extraction method failed:', error.message)
      }

      if (jsonData) return jsonData

      // Method 2: Check body text directly
      if (bodyText) {
        const mdMatch = bodyText.match(/MD\s*[:=]\s*["']?([^"'\s<>]+)["']?/i)
        const paResMatch = bodyText.match(
          /PaRes\s*[:=]\s*["']?([^"'\s<>]+)["']?/i
        )

        if (mdMatch && mdMatch[1] && paResMatch && paResMatch[1]) {
          if (debug) console.log('✅ Found data in body text')
          return {
            transactionId: mdMatch[1],
            paRes: paResMatch[1],
            success: true,
          }
        }
      }

      // Method 3: Try to find form input fields
      const mdMatch = htmlContent.match(
        /<input[^>]*name=["']?MD["']?[^>]*value=["']([^"']+)["'][^>]*>/i
      )
      const paResMatch = htmlContent.match(
        /<input[^>]*name=["']?PaRes["']?[^>]*value=["']([^"']+)["'][^>]*>/i
      )

      if (mdMatch && mdMatch[1] && paResMatch && paResMatch[1]) {
        if (debug) console.log('✅ Found data using input fields')
        return {
          transactionId: mdMatch[1],
          paRes: paResMatch[1],
          success: true,
        }
      }

      // Method 4: Look for specific patterns in HTML content
      const mdPattern = /MD[=:]\s*["']?([^"'\s&<>]+)["']?/i
      const paResPattern = /PaRes[=:]\s*["']?([^"'\s&<>]+)["']?/i

      const mdHtmlMatch = htmlContent.match(mdPattern)
      const paResHtmlMatch = htmlContent.match(paResPattern)

      if (
        mdHtmlMatch &&
        mdHtmlMatch[1] &&
        paResHtmlMatch &&
        paResHtmlMatch[1]
      ) {
        if (debug) console.log('✅ Found data using HTML pattern matching')
        return {
          transactionId: mdHtmlMatch[1],
          paRes: paResHtmlMatch[1],
          success: true,
        }
      }

      // Method 5: Try a broader approach by looking for any JSON object that has MD and PaRes
      try {
        const jsonRegex = /{[^{}]*}/g
        const jsonMatches = htmlContent.match(jsonRegex)

        if (jsonMatches) {
          for (const potentialJson of jsonMatches) {
            try {
              const parsedObj = JSON.parse(potentialJson)
              if (parsedObj.MD && parsedObj.PaRes) {
                if (debug) console.log('✅ Found data in embedded JSON object')
                return {
                  transactionId: parsedObj.MD,
                  paRes: parsedObj.PaRes,
                  success: true,
                }
              }
            } catch (e) {
              // Silently ignore parsing errors for individual matches
            }
          }
        }
      } catch (e) {
        if (debug) console.log('JSON regex search failed:', e)
      }

      // If we reach here, none of our extraction methods worked
      throw new Error('Could not extract MD and PaRes using any method')
    } catch (error) {
      if (debug) console.error('❌ Error extracting 3DS data:', error)
      throw error
    }
  }

  // Handle messages from the WebView content
  const handleMessage = (event: WebViewMessageEvent) => {
    let postData: PostMessageData | null = null

    try {
      postData = JSON.parse(event.nativeEvent.data)
    } catch (e) {
      console.error('Error parsing message from WebView:', e)
      return // Ignore non-JSON messages
    }

    // Handle different message types
    if (postData && postData.type === '3dsResult') {
      // Handle standard postMessage from server (existing flow)
      if (debug) console.log('Received 3DS Result message:', postData)

      if (postData.status === 'success') {
        onComplete?.({ ...(postData.data ?? {}), success: true })
      } else {
        onError?.(
          new Error(
            postData.error ||
              '3DS authentication failed or encountered an error.'
          )
        )
      }
      onClose?.()
    } else if (postData && postData.type === 'htmlContent') {
      // Process HTML content from our injected script
      if (debug) console.log('Received HTML content, processing...')

      // Extract data from the current page
      try {
        const extractedData = extractDataFromHtml({
          content: postData.content || '',
          formData: postData.formData,
          urlParams: postData.urlParams,
          bodyText: postData.bodyText,
        })

        if (extractedData) {
          if (debug)
            console.log('✅ Successfully extracted 3DS data:', extractedData)

          // Call the completion handler with the extracted data
          onComplete?.(extractedData)
          onClose?.()
        }
      } catch (error) {
        // Instead of treating this as a fatal error, log it and continue
        if (debug) {
          console.log(
            '⚠️ Extraction failed for this page, waiting for more redirects...'
          )
          console.log(
            'HTML snippet (first 200 chars):',
            (postData.content || '').substring(0, 200)
          )
        }
      }
    } else if (postData && postData.type === 'log' && debug) {
      // Only log in debug mode
      console.log(`WebView Log (${postData.level}):`, postData.message)
    } else if (debug) {
      console.warn('Received unexpected message format from WebView:', postData)
    }
  }

  const renderContent = () => {
    if (errorState) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTextTitle}>{errorTitle}</Text>
          <Text style={styles.errorText}>{errorState}</Text>
        </View>
      )
    }

    return (
      <>
        {webViewSource && !errorState && (
          <WebView
            key={webViewSource.html}
            ref={webViewRef}
            source={webViewSource}
            onNavigationStateChange={handleNavigationStateChange}
            onError={handleWebViewError}
            onLoadEnd={handleLoadEnd}
            onMessage={handleMessage}
            style={[styles.webView, webViewStyle]}
            domStorageEnabled={true}
            originWhitelist={['*']} // Keep this permissive for redirects
            startInLoadingState={false}
            // Injected script for debug logging and event handling
            injectedJavaScript={`
              (function() {
                function sendLog(level, args) {
                  try {
                    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'log',
                        level: level,
                        message: Array.from(args).map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')
                      }));
                    }
                  } catch (e) {}
                }

                // Override console methods
                const originalLog = console.log;
                console.log = function() { originalLog.apply(console, arguments); sendLog('log', Array.from(arguments)); };
                const originalWarn = console.warn;
                console.warn = function() { originalWarn.apply(console, arguments); sendLog('warn', Array.from(arguments)); };
                const originalError = console.error;
                console.error = function() { originalError.apply(console, arguments); sendLog('error', Array.from(arguments)); };
                const originalInfo = console.info;
                console.info = function() { originalInfo.apply(console, arguments); sendLog('info', Array.from(arguments)); };

                // Add global error handlers
                window.addEventListener('error', function(event) {
                  sendLog('error', ['Uncaught error:', event.message, 'at', event.filename, ':', event.lineno]);
                });
                window.addEventListener('unhandledrejection', function(event) {
                  sendLog('error', ['Unhandled promise rejection:', event.reason]);
                });

                sendLog('info', ['injectedJavaScript executed']);
              })();
              true;
            `}
          />
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>
              {isTermUrlReached ? processingText : loadingText}
            </Text>
          </View>
        )}

        {showCloseButton && (
          <View style={styles.closeButtonContainer}>
            {renderCloseButton ? (
              renderCloseButton()
            ) : (
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            )}
          </View>
        )}
      </>
    )
  }

  return (
    <View style={[styles.container, containerStyle]}>{renderContent()}</View>
  )
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
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
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
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
  closeButtonContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 20,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default ThreeDSecureView
