import SwiftUI
import WebKit

struct ContentView: View {
    let appUrl = URL(string: "https://expense-trackercom.vercel.app/")!

    var body: some View {
        ZStack {
            Color(red: 7/255, green: 19/255, blue: 18/255)
                .ignoresSafeArea()
            PWAWebView(url: appUrl)
                .ignoresSafeArea()
        }
    }
}

struct PWAWebView: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.applicationNameForUserAgent = "ExpenseTrackerPWA/1.0.0"

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 7/255, green: 19/255, blue: 18/255, alpha: 1)
        webView.scrollView.bounces = true
        webView.load(URLRequest(url: url))
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}
}
