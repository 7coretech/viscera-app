# 🚀 VISCERA CONNECT™ — MASTER AI HANDOVER & UNIVERSAL CONTEXT PROMPT
Please read this context carefully to resume work on the Viscera Connect Healthcare Job & Staffing Platform:

---

## 📌 1. Workspaces & Repositories (Located at D:\7coretech\):
- **Web App (Nurse & Recruiter Portal)**: `D:\7coretech\viscera` 
  - Live: `https://app.visceraconnect.com` (Main Website: `https://visceraconnect.com`)
  - Tech: React.js (CRA), Redux Toolkit, Material-UI, Axios
  - Branch: `master`
- **Backend REST API & WebSockets**: `D:\7coretech\viscera-backend` 
  - Live: `https://api.visceraconnect.com`
  - Tech: Node.js (ES Modules), Express.js, MongoDB (Mongoose), Socket.IO, AWS/DO S3 SDK, Stripe
  - Branch: `master`
- **Nurse Mobile Application**: `D:\7coretech\viscera-app` 
  - Tech: React Native (Expo SDK), TypeScript, NativeWind/Tailwind, Redux
  - Branch: `main`

---

## 🏢 2. Production Infrastructure & Cloud Services:
- **Cloudflare Proxy (Orange Cloud)**: Active on `app.visceraconnect.com` & `visceraconnect.com` (SSL/TLS, DDoS, HSTS).
- **Backend Droplet Server**: Ubuntu Server (`129.212.183.177`) managed with `pm2`.
- **Cloud Object Storage (DigitalOcean Spaces)**:
  - Bucket: `viscera` (Region: `sfo3`)
  - Endpoint: `https://sfo3.digitaloceanspaces.com`
  - Key: `DO00UAZJNM66847UUZ9A`
  - Secret: `obN5q8tJArHDsDl7R6MNmNsQPBwioVIeqH/iK0zKibA`
- **Transactional Emails**: Brevo SMTP (`smtp-relay.brevo.com:587`, Sender: `Team@viscerastaff.com`).
- **Database**: MongoDB Atlas (`viscera` database).

---

## 🛠️ 3. Key Solutions & Architecture Implemented:

### A. Security Audit Hardening (Fix IT Technologies Assessment):
1. **Frontend Source Maps Disabled (`viscera`)**:
   - `GENERATE_SOURCEMAP=false` set in `.env` and `package.json` build script. No `.map` files exposed.
2. **User Enumeration Prevention on Password Reset (`viscera-backend`)**:
   - `forgotPassword()` in `auth.service.js` returns a generic success response even if the email does not exist in DB, preventing user enumeration attacks.
3. **Login & OTP Rate Limiting (`viscera-backend`)**:
   - `express-rate-limit` attached on `/api/v1/auth/login`, `/register`, `/forgot-password`, `/verify-forgot-password-otp` (10 req/15 min on auth, 5 req/15 min on OTP) returning `429 Too Many Requests`.
4. **Browser Security Headers & Helmet (`viscera-backend` & `viscera`)**:
   - Backend uses `helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })` for HSTS, `X-Frame-Options`, `nosniff`, CSP.
   - Frontend `index.html` has security meta tags (`X-Frame-Options: SAMEORIGIN`, `nosniff`, `referrer-policy`).
5. **CORS Lockdown (`viscera-backend`)**:
   - Restricted strictly to `https://app.visceraconnect.com` and `https://visceraconnect.com` with `credentials: true`.
6. **Mobile Legal Consent (`viscera-app`)**:
   - Registration flow (`BasicInfo.tsx`) includes clickable *"Terms of Service"* and *"Privacy Policy"* consent disclaimer.

### B. Mobile App Real-Time Synchronization & UI (`viscera-app`):
1. **Real-time Socket.IO & Notifications**:
   - `socketService.ts` connects to `https://api.visceraconnect.com` with JWT auth token handshake.
   - `useFocusEffect` auto-refreshes Chat List, Chat Room, and Notifications whenever the tab is focused.
   - Dashboard shows live unread notification badge counter.
   - Replaced external dummy placeholder avatars (`pravatar.cc`) with clean initial letter badges.
2. **Dynamic Profile Cards**:
   - `ProfileScreen.tsx` dynamically calculates live completion and counts for Licenses, Resumes, Experience, Documents, Skills, Preferences instead of hardcoded static labels.

### C. File Upload Architecture (Licenses, Resumes, Documents):
1. **Mobile Uploads Engine**:
   - `appService.ts` uses **Native `fetch`** engine (`uploadFormData`) to preserve multipart boundaries and avoid Axios Android network drops.
2. **S3 Backend Service**:
   - `cloud.provider.js` dynamically extracts the DO Spaces region (`sfo3`) and sanitizes endpoint URLs to prevent bucket double-prefixing.
   - Presigned URLs for license viewing (`getLicenseByIdData`) extract string keys from `fileKey: [String]` arrays with 1-hour expiry.

### D. Production Database Sanitization:
- Soft-deleted all 22 dummy/test jobs ("Good", "Demo", "NO", test location mismatches) from production DB via `/internal/maintenance/cleanup-test-jobs`. Public API `/api/v1/jobs` only returns genuine active jobs.

---

## 💻 4. Quick Commands & Deployment:

- **Web App (`viscera`)**:
  - Run locally: `cd d:\7coretech\viscera && npm start`
  - Push changes: `git add . && git commit -m "..." && git push origin master`
- **Backend API (`viscera-backend`)**:
  - Run locally: `cd d:\7coretech\viscera-backend && npm run dev`
  - Health check: `https://api.visceraconnect.com/health-check`
  - Push changes: `git add . && git commit -m "..." && git push origin master` (Server pulls & restarts with `pm2 restart all`)
- **Mobile App (`viscera-app`)**:
  - Run locally: `cd d:\7coretech\viscera-app && npx expo start`
  - Build Android APK: `eas build -p android --profile preview`
  - Push changes: `git add . && git commit -m "..." && git push origin main`
