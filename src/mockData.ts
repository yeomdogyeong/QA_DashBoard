export interface SampleDataset {
  id: string;
  name: string;
  description: string;
  type: "tests" | "defects";
  csvContent: string;
}

export const sampleDatasets: SampleDataset[] = [
  {
    id: "regression-suite",
    name: "Web App v3.2 Regression Test Suite Execution Log",
    description: "Contains pass/fail logs, executing priority, modules, testers, and automation flags for a full enterprise regression cycle.",
    type: "tests",
    csvContent: `"Test Case ID","Title","Module","Status","Priority","Tester","Execution Date","Automated","Environment"
"TC-AUTH-01","User Login with Email/Password","Authentication","Pass","P0","Alice Kim","2026-06-15","Yes","Production"
"TC-AUTH-02","SSO OAuth with Google Account","Authentication","Pass","P0","Alice Kim","2026-06-15","No","Staging"
"TC-AUTH-03","Password Reset Verification Link","Authentication","Fail","P1","Alice Kim","2026-06-16","Yes","Staging"
"TC-AUTH-04","Multi-Factor Authentication Setup","Authentication","Pass","P1","David Park","2026-06-16","No","Staging"
"TC-PAY-01","Staging Credit Card Charge Success","Payment Gateway","Pass","P0","Charlie Lee","2026-06-15","Yes","Staging"
"TC-PAY-02","Declined Card Error Message Validation","Payment Gateway","Pass","P1","Charlie Lee","2026-06-15","Yes","Staging"
"TC-PAY-03","Subscription Renewal Webhook Action","Payment Gateway","Fail","P0","Charlie Lee","2026-06-17","Yes","Staging"
"TC-PAY-04","Refund Issuance via Admin Console","Payment Gateway","Blocked","P1","Charlie Lee","2026-06-17","No","Staging"
"TC-DASH-01","Data Visualizer Chart Render","Dashboard","Pass","P1","Sarah Moon","2026-06-16","Yes","Production"
"TC-DASH-02","Period Filter Analytics Update","Dashboard","Pass","P2","Sarah Moon","2026-06-16","No","Staging"
"TC-DASH-03","Export Report to CSV Action","Dashboard","Pass","P2","Sarah Moon","2026-06-16","Yes","Staging"
"TC-DASH-04","Export Report to PDF (High Load)","Dashboard","Fail","P1","Sarah Moon","2026-06-18","No","Staging"
"TC-SETT-01","Profile Name & Avatar Update","User Settings","Pass","P2","David Park","2026-06-15","Yes","Production"
"TC-SETT-02","Password Change Verification","User Settings","Pass","P1","David Park","2026-06-15","Yes","Staging"
"TC-SETT-03","Push Notification Preferences","User Settings","Skipped","P3","David Park","2026-06-18","No","Staging"
"TC-SETT-04","Account Deletion Flow with Guardrail","User Settings","Pass","P0","Alice Kim","2026-06-18","No","Staging"
"TC-NOTI-01","Real-time Socket Alert Dispatch","Notifications","Fail","P1","Sarah Moon","2026-06-19","Yes","Staging"
"TC-NOTI-02","Weekly Digest Email Scheduler","Notifications","Pass","P2","Sarah Moon","2026-06-19","Yes","Staging"
"TC-NOTI-03","Mobile SMS Push via Twilio API","Notifications","Blocked","P1","David Park","2026-06-19","No","Staging"
"TC-CART-01","Add Item to Cart from PDP","E-Commerce Core","Pass","P0","Alice Kim","2026-06-20","Yes","Staging"
"TC-CART-02","Cart Quantity Adjustment and Live Total","E-Commerce Core","Pass","P0","Alice Kim","2026-06-20","Yes","Staging"
"TC-CART-03","Apply Valid Promo Code Discount","E-Commerce Core","Pass","P1","Charlie Lee","2026-06-20","Yes","Staging"
"TC-CART-04","Apply Expired Promo Code Validation","E-Commerce Core","Pass","P2","Charlie Lee","2026-06-21","Yes","Staging"
"TC-CART-05","Guest Checkout Billing/Shipping Sync","E-Commerce Core","Fail","P0","Charlie Lee","2026-06-21","No","Staging"
"TC-SCH-01","Calendar Booking Slots Availability","Scheduling","Pass","P1","David Park","2026-06-22","No","Production"
"TC-SCH-02","Conflict Booking Prevention Check","Scheduling","Fail","P1","David Park","2026-06-22","Yes","Staging"
"TC-SCH-03","Timezone Auto-adjustment for Client","Scheduling","Pass","P2","Alice Kim","2026-06-23","No","Staging"`
  },
  {
    id: "defect-audit",
    name: "Mobile App Launch Pre-Release Defect Log",
    description: "A detailed list of pre-launch bugs detailing severity (Critical, High, Medium, Low), status, assigned engineers, and target resolution date.",
    type: "defects",
    csvContent: `"Bug ID","Summary","Module","Severity","Priority","Status","Reporter","Developer","Logged Date","Target Fix Date"
"BUG-401","App Crash on launch in iOS 14.x","Core Engine","Critical","P0","Open","David Park","Minho Kim","2026-06-20","2026-06-23"
"BUG-402","Token Expiry Loop on Slow Cellular Connect","Network API","High","P0","In Progress","Alice Kim","Yuri Cho","2026-06-20","2026-06-24"
"BUG-403","Infinite Spinner on Credit Card Sandbox Charge","Payment","Critical","P0","Resolved","Charlie Lee","Hyeon Woo","2026-06-21","2026-06-22"
"BUG-404","Missing Translation Keys in Checkout Settings","Settings","Low","P3","Closed","Sarah Moon","Yuri Cho","2026-06-21","2026-06-22"
"BUG-405","Push Notifications fail on Android 12 background","Notifications","High","P1","Open","David Park","Jiwon Shin","2026-06-22","2026-06-25"
"BUG-406","Item Count discrepancy in cart badge","E-Commerce","Medium","P2","Resolved","Alice Kim","Hyeon Woo","2026-06-22","2026-06-24"
"BUG-407","Product Image scaling on narrow viewports","UI Styling","Low","P2","In Progress","Sarah Moon","Yuri Cho","2026-06-22","2026-06-26"
"BUG-408","Search Results pagination returns duplicate items","Search Engine","Medium","P1","Open","Alice Kim","Minho Kim","2026-06-23","2026-06-26"
"BUG-409","Payment session timeout creates dangling webhook","Payment","High","P0","Open","Charlie Lee","Hyeon Woo","2026-06-23","2026-06-25"
"BUG-410","Biometric authentication toggle switches off on reload","Authentication","Medium","P1","Resolved","Alice Kim","Jiwon Shin","2026-06-24","2026-06-25"
"BUG-411","Terms of Service PDF link results in 404 Error","Settings","Low","P3","Open","Sarah Moon","Yuri Cho","2026-06-24","2026-06-28"
"BUG-412","Memory Leak on rapid horizontal tab switches","Core Engine","High","P1","In Progress","David Park","Minho Kim","2026-06-24","2026-06-27"
"BUG-413","Order history list sorts dates lexicographically","E-Commerce","Medium","P2","Open","Charlie Lee","Hyeon Woo","2026-06-25","2026-06-29"
"BUG-414","Failed background sync freezes main UI thread","Core Engine","Critical","P0","In Progress","David Park","Minho Kim","2026-06-25","2026-06-27"`
  },
  {
    id: "compliance-checklist",
    name: "Enterprise ISO/IEC Security Compliance QA Audit",
    description: "An organizational audit log tracking compliance checkboxes across various security fields, priority, status, and remediation timeline.",
    type: "tests",
    csvContent: `"Item ID","Audit Title","Domain","Status","Priority","Auditor","Review Date","Remediation Cost","Risk Level"
"SEC-01","Data Encryption at Rest (AES-256)","Security Standards","Pass","P0","Grace Hopper","2026-06-10","None","Low"
"SEC-02","Data Encryption in Transit (TLS 1.3)","Security Standards","Pass","P0","Grace Hopper","2026-06-10","None","Low"
"SEC-03","Regular database backups verification","Infrastructure","Pass","P1","Ken Thompson","2026-06-11","None","Medium"
"SEC-04","Cross-Region Disaster Recovery Sync","Infrastructure","Fail","P0","Ken Thompson","2026-06-12","High","Critical"
"SEC-05","Password Complexity Rules Enforcement","Identity & Access","Pass","P1","Grace Hopper","2026-06-12","None","Low"
"SEC-06","MFA implementation for root administrators","Identity & Access","Pass","P0","Grace Hopper","2026-06-13","None","High"
"SEC-07","API Endpoint Penetration Scan Cycle","Vulnerability Audit","Fail","P1","Ken Thompson","2026-06-14","Medium","High"
"SEC-08","Third-party npm dependency vulnerability audit","Vulnerability Audit","Pass","P2","Ken Thompson","2026-06-14","None","Low"
"SEC-09","Revocation cycle for developer SSH keys","Identity & Access","Blocked","P1","Grace Hopper","2026-06-15","Low","Medium"
"SEC-10","GDPR compliant user deletion API","Compliance Privacy","Fail","P0","Dennis Ritchie","2026-06-16","Medium","Critical"
"SEC-11","Privacy Policy disclosure popup on signup","Compliance Privacy","Pass","P2","Dennis Ritchie","2026-06-16","None","Low"
"SEC-12","Database connection secret rotation interval","Infrastructure","Pass","P1","Ken Thompson","2026-06-17","None","Medium"
"SEC-13","Access logs audit trail persistence to S3","Compliance Privacy","Pass","P2","Dennis Ritchie","2026-06-18","None","Low"`
  }
];
