# ExpenseTracker AI — Installable Apps & Store Packages

This directory contains standalone packages and project structures for running **ExpenseTracker AI** as an installable native application across desktop and mobile platforms, as well as store-ready formats.

---

## 1. macOS Standalone App (`ExpenseTracker.app`)
A ready-to-run native macOS application bundle with high-resolution app icon:
* **Location:** `installable-apps/ExpenseTracker.app`
* **How to Run:** Double-click `ExpenseTracker.app` in Finder or run:
  ```bash
  open /Users/saisankar/Downloads/AI/ExpenseTracker/installable-apps/ExpenseTracker.app
  ```
* It launches ExpenseTracker in a dedicated standalone app window without browser tabs or address bars.

---

## 2. Android App (Trusted Web Activity / TWA)
A complete Android Studio project configured with Google's official AndroidX Browser Helper:
* **Location:** `installable-apps/android-twa/`
* **Package ID:** `app.vercel.expensetrackercom.twa`
* **How to Build APK/AAB:**
  1. Open the `android-twa` folder in Android Studio.
  2. Select **Build > Generate Signed Bundle / APK**.
  3. Choose **Android App Bundle (.aab)** for Google Play Console or **APK** for direct sideloading.
* **Digital Asset Links:**
  The `assetlinks.json` file is already in your `frontend/public/.well-known/assetlinks.json` so Android can automatically verify domain ownership and hide the URL bar.

---

## 3. Windows Package (`windows-msix`)
Hosted App configuration for Windows 10 & 11:
* **Location:** `installable-apps/windows-msix/`
* **Manifest:** `AppxManifest.xml` configured for `https://expense-trackercom.vercel.app/`
* **Local Installation:**
  Run the included PowerShell script in an elevated terminal:
  ```powershell
  cd windows-msix
  powershell -ExecutionPolicy Bypass -File Install-App.ps1
  ```
* **Microsoft Store Submission:**
  Use the Microsoft Store Partner Center to upload this Hosted App manifest or generate the final `.msix` via [PWABuilder](https://www.pwabuilder.com/).

---

## 4. iOS App (`ios-wrapper`)
A native SwiftUI + WebKit wrapper for iPhone and iPad:
* **Location:** `installable-apps/ios-wrapper/`
* **Files:** `ExpenseTrackerApp.swift` and `ContentView.swift`
* **How to Build:**
  1. Create a new iOS App project in Xcode.
  2. Add these two Swift files to your project.
  3. Archive and upload to App Store Connect via Xcode.

---

## 5. Direct Browser & PWABuilder Installation
* **Desktop (Mac/Windows/Linux):** Open [ExpenseTracker](https://expense-trackercom.vercel.app/) in Chrome or Edge, and click the **Install App** icon in the address bar or the bottom PWA install banner.
* **Mobile (Android/iOS):**
  * **Android:** Tap "Add to Home screen" or use the install prompt banner.
  * **iPhone/iPad:** Tap the Share button in Safari and choose **"Add to Home Screen"**.
* **Cloud Packaging via PWABuilder:**
  Once your latest changes are pushed and deployed to Vercel, visit your [PWABuilder Report Card](https://www.pwabuilder.com/reportcard?site=https://expense-trackercom.vercel.app/) to download pre-signed `.aab`, `.msix`, and iOS zip files directly from the cloud.
