#import <WebKit/WebKit.h>
#import <NitroModules/NitroModules.h>

// Import WebKit to ensure it's available to generated Swift headers
@interface WKNavigationDelegateForward : NSObject <WKNavigationDelegate>
@end

@implementation WKNavigationDelegateForward
- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation {}
- (void)webView:(WKWebView *)webView didFailNavigation:(WKNavigation *)navigation withError:(NSError *)error {}
- (void)webView:(WKWebView *)webView didFailProvisionalNavigation:(WKNavigation *)navigation withError:(NSError *)error {}
@end
