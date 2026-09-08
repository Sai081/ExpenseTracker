# Run in PowerShell to sideload on Windows
Add-AppxPackage -Register AppxManifest.xml
Write-Host "ExpenseTracker AI has been registered as a native Windows PWA!" -ForegroundColor Green
