# AI Powered Smart Tourism Platform — Implementation Plan

## Overview

Building a full-stack MERN application with AI-powered trip planning, guide marketplace, travel videos explorer, chatbot, PDF export, and admin dashboard. All APIs used are free-tier only.

> [!IMPORTANT]
> This is a large project built **step by step**. Each phase depends on the previous one. API keys for Gemini, Unsplash, Cloudinary, OpenWeather, and SMTP must be provided in the `.env` file before running.

---

## Proposed Changes

### Step 1 — Project Folder Structure

Directories to scaffold:

```
AI_TOURISM_WEBSIT/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
└── client/   (Vite + React + Tailwind)
    ├── components/
    ├── context/
    ├── hooks/
    ├── pages/
    └── services/
```

---

### Step 2 — Backend Server Setup

#### [NEW] `server/package.json`
Initialize Node project with all dependencies:
`express`, `mongoose`, `dotenv`, `cors`, `bcryptjs`, `jsonwebtoken`, `nodemailer`, `@google/generative-ai`, `axios`, `cloudinary`, `multer`, `node-cron`, `pdfkit`, `node-fetch`

#### [NEW] `server/index.js`
Express entry point with CORS, JSON middleware, route mounting, error handler.

#### [NEW] `server/config/db.js`
Mongoose connection with error handling.

#### [NEW] `server/.env` (template)
All environment variable keys documented.

---

### Step 3 — Database Schemas

#### [NEW] `server/models/User.js`
Fields: `name`, `email`, `password`, `profileImage`, `isGuide`, `isAdmin`, `isVerified`, `resetPasswordToken`, `resetPasswordExpire`, `verificationToken`, `travelStats { totalTrips, citiesVisited, countriesVisited, totalDays }`, `createdAt`

#### [NEW] `server/models/Trip.js`
Fields: `userId`, `source`, `destination`, `startDate`, `endDate`, `budget`, `members`, `accommodationType`, `aiResponse { overview, daily_itinerary, transportation, hotels, budget_breakdown, packing_checklist, travel_warnings }`, `images[]`, `createdAt`

#### [NEW] `server/models/Guide.js`
Fields: `userId`, `city`, `languages[]`, `experience`, `description`, `rating`, `profileImage`, `isAvailable`

#### [NEW] `server/models/GuideApplication.js`
Fields: `userId`, `city`, `languages[]`, `experience`, `description`, `identityDocument`, `status (pending/approved/rejected)`

#### [NEW] `server/models/ChatMessage.js`
Fields: `tripId`, `senderId`, `receiverId`, `originalText`, `translatedText`, `senderLanguage`, `createdAt`

#### [NEW] `server/models/Video.js`
Fields: `title`, `description`, `cloudinaryUrl`, `publicId`, `thumbnail`, `uploadedBy`, `createdAt`

#### [NEW] `server/models/Reminder.js`
Fields: `userId`, `tripId`, `reminderDate`, `type`, `sent`

---

### Step 4 — Authentication System

#### [NEW] `server/controllers/authController.js`
- `register`: hash password, generate verification token, send email via Nodemailer
- `login`: verify credentials, return JWT
- `logout`: clear token
- `forgotPassword`: generate reset token, send email
- `resetPassword`: validate token, update password
- `verifyEmail`: mark user verified

#### [NEW] `server/middlewares/authMiddleware.js`
JWT verification middleware + admin role check middleware.

#### [NEW] `server/routes/authRoutes.js`

#### [NEW] `server/services/emailService.js`
Nodemailer SMTP transporter for verification & reset emails.

---

### Step 5 — AI Trip Generation

#### [NEW] `server/services/geminiService.js`
Google Gemini API integration — sends trip details, parses structured JSON response.

#### [NEW] `server/controllers/tripController.js`
- `createTrip`: call Gemini, fetch Unsplash images, save trip
- `getMyTrips`: paginated user trips
- `getTripById`: full trip detail
- `deleteTrip`: remove trip
- `downloadTripPDF`: generate and stream PDF

#### [NEW] `server/routes/tripRoutes.js`

---

### Step 6 — Unsplash Image Service

#### [NEW] `server/services/unsplashService.js`
Fetch destination images, tourist attraction images, hotel images with fallback logic.

---

### Step 7 — Guide Marketplace

#### [NEW] `server/controllers/guideController.js`
- `getGuidesByCity`: list guides
- `applyToBeGuide`: submit application
- `requestGuide`: user sends guide request
- `respondToRequest`: guide accepts/rejects

#### [NEW] `server/controllers/chatController.js`
- `sendMessage`: AI translate with Gemini, save both versions
- `getMessages`: fetch message thread

#### [NEW] `server/routes/guideRoutes.js`
#### [NEW] `server/routes/chatRoutes.js`

---

### Step 8 — Admin Dashboard Backend

#### [NEW] `server/controllers/adminController.js`
- `getAllUsers`
- `getPendingApplications` / `approveApplication` / `rejectApplication`
- `uploadVideo` / `deleteVideo` / `getAllVideos`
- `getPlatformAnalytics`

#### [NEW] `server/services/cloudinaryService.js`
Cloudinary video upload with multer.

#### [NEW] `server/routes/adminRoutes.js`

---

### Step 9 — Weather & Reminders

#### [NEW] `server/services/weatherService.js`
OpenWeather API call for destination city.

#### [NEW] `server/controllers/weatherController.js`
#### [NEW] `server/routes/weatherRoutes.js`

#### [NEW] `server/utils/reminderScheduler.js`
`node-cron` job — runs daily at 8am, checks trips starting in 3/1 days, sends email reminders.

---

### Step 10 — Frontend (React + Vite + Tailwind)

#### Pages

| Page | Description |
|---|---|
| `HomePage` | Hero, features, CTA |
| `LoginPage` | JWT login form |
| `SignupPage` | Registration + email verify |
| `ForgotPasswordPage` | Trigger reset email |
| `ResetPasswordPage` | New password form |
| `CreateTripPage` | Trip form → AI generation |
| `TripDetailPage` | Full itinerary, map, weather, PDF download |
| `MyTripsPage` | User's trips list |
| `ExplorePage` | Video gallery from Cloudinary |
| `GuideMarketplacePage` | Browse + request guides |
| `ChatPage` | Real-time chat with guide (with translation) |
| `ProfilePage` | Stats, edit profile |
| `AdminDashboardPage` | All admin panels |
| `ChatbotPage` | AI travel chatbot |

#### Key Components
- `Navbar`, `Footer`, `ProtectedRoute`
- `LeafletMap` — Leaflet.js with OpenStreetMap
- `WeatherWidget` — OpenWeather display
- `AIChatbot` — Floating Gemini chatbot
- `TripCard`, `GuideCard`, `VideoCard`
- `PDFDownloadButton`

#### Context / Hooks
- `AuthContext` (user state, login/logout)
- `useTripGeneration`, `useGuides`, `useWeather`

#### Service Layer
- `api.js` — Axios instance with JWT interceptor
- `tripService.js`, `authService.js`, `guideService.js`, `adminService.js`

---

### Step 11 — PDF Generation

#### [MODIFY] `server/controllers/tripController.js`
`downloadTripPDF` uses `pdfkit` to generate and stream a PDF with:
- Trip overview, daily itinerary, hotels, transportation, packing checklist

---

### Step 12 — Reminders System

`node-cron` job scheduled in `server/utils/reminderScheduler.js` sends Nodemailer emails to users whose trips start in 3 or 1 days including weather alert.

---

### Environment Variables (`.env`)

```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password

# Google Gemini
GEMINI_API_KEY=your_gemini_key

# Unsplash
UNSPLASH_ACCESS_KEY=your_unsplash_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# OpenWeather
OPENWEATHER_API_KEY=

# Frontend URL
CLIENT_URL=http://localhost:5173
```

---

## Verification Plan

### Automated / Manual Tests

1. **Auth Flow**
   - Run: `curl -X POST http://localhost:5000/api/auth/register` with test body
   - Run: `curl -X POST http://localhost:5000/api/auth/login`
   - Verify JWT token returned

2. **AI Trip Generation**
   - Login, then POST to `http://localhost:5000/api/trips` with trip details
   - Verify JSON response saved in MongoDB (check MongoDB Atlas or Compass)

3. **Frontend Pages**
   - Run `npm run dev` in `/client`
   - Open `http://localhost:5173`
   - Navigate through Signup → Login → Create Trip → View Trip Detail

4. **Guide Marketplace**
   - Apply as guide → Admin approves → Browse guides → Request guide → Accept → Chat

5. **Admin Dashboard**
   - Login as admin → View users, approve guides, upload video, view analytics

6. **PDF Download**
   - On trip detail page, click "Download Itinerary PDF" → file saves locally

7. **Weather Widget**
   - On trip detail page, verify weather data loads for destination city

### Browser Verification
After frontend is built, browser subagent will navigate to `http://localhost:5173` to visually verify all pages render correctly.
