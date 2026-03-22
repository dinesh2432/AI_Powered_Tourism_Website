# 🌍 AI-Powered Smart Tourism Platform
## Comprehensive Project Documentation

---

## 1. Executive Summary & Project Overview

The **AI-Powered Smart Tourism Platform** is a full-stack SaaS application designed to revolutionize travel planning. It leverages Generative AI (Google Gemini) to automatically generate highly detailed, personalized travel itineraries based on user preferences. 

Beyond core AI trip generation, the platform functions as an entire ecosystem for travelers and guides. It features a **trip collaboration system**, an **AI travel chatbot**, a **marketplace for local guides**, **real-time weather intelligence**, and a **robust subscription & payment tiering system**.

This platform is built using the **MERN** stack (MongoDB, Express, React, Node.js) with a modern, high-performance UI tailored using Tailwind CSS. 

---

## 2. Technology Stack & Architecture

### Frontend (Client-Side)
- **Framework:** React.js 19 + Vite
- **Styling:** Tailwind CSS v3, Framer Motion (Animations)
- **Routing:** React Router DOM v7
- **Mapping:** Leaflet.js & React-Leaflet
- **HTTP Client:** Axios
- **State Management:** React Context API (AuthContext)
- **Exporting:** jsPDF & html2canvas

### Backend (Server-Side)
- **Runtime:** Node.js
- **Framework:** Express.js (REST API architecture)
- **Authentication:** JSON Web Tokens (JWT) + bcryptjs
- **Database:** MongoDB (via Mongoose ODM)
- **Scheduling:** node-cron (Automated Trip Reminders)

### External Integrations & 3rd Party APIs
1. **Google Gemini API:** Core engine for generating smart trip itineraries and acting as the Chatbot brain.
2. **Razorpay API:** Processes secure payments for SAAS subscription tiers (PRO, PREMIUM).
3. **Cloudinary API:** Handles secure upload, storage, and retrieval of videos (e.g., Destination Explore Videos).
4. **Unsplash API:** Dynamically fetches high-quality destination images based on the generated AI trips.
5. **OpenWeather API:** Provides real-time weather forecasts mapped to user trip dates and destinations.
6. **Nodemailer (SMTP):** Sends automated system emails (Registration, Password Resets, Trip Reminders).

---

## 3. Core Features & Business Modules

### A. AI Trip Generation Engine
Users input their destination, budget, dates, and preferences. The backend feeds this into the Gemini AI model to construct a JSON response outlining day-by-day itineraries, recommended places, expenses, and travel tips.

### B. Monetization & Subscription System (SaaS)
The platform restricts features using a Tiered Subscription Model:
- **FREE Tier:** Max 3 AI Trips per month.
- **PRO Tier (₹499/mo):** Unlimited Trips, unlocked PDF exporting.
- **PREMIUM Tier (₹999/mo):** All PRO features + advanced AI Concierge chat (future roadmap).
*(Powered by Razorpay checkout flows and backend HMAC-SHA256 signature verification).*

### C. Collaborative Travel Planning
Users can generate a unique `shareLinkToken` to share their AI-generated trips with friends via a public URL, allowing read-only access to the itinerary without requiring authentication.

### D. Local Guide Marketplace
Users can browse "Local Guides" registered on the platform. Guides can submit applications which an Admin reviews and approves. Once approved, travelers can connect with guides and chat dynamically.

### E. Admin Dashboard Analytics
Admins have elevated privileges to:
- Monitor user count and generated trips.
- Approve/Reject local guide applications.
- Upload/Manage high-quality destination videos directly to Cloudinary.
- Override user subscription plans manually (FREE to PRO/PREMIUM).

---

## 4. Key User Workflows

### 4.1. The AI Trip Generation Workflow
1. **Input:** User fills out the "Create Trip" form (Destination, Days, Budget, Companions).
2. **Validation:** Backend ensures the user has not exceeded their tier limit.
3. **AI Generation:** Backend prompts Gemini API, enforcing JSON output formatting.
4. **Media Fetching:** Backend simultaneously fetches destination images via Unsplash.
5. **Save to DB:** The structured itinerary is saved to `Trip` collection linked to the `userId`.
6. **Rendering:** The Frontend renders the trip data alongside an interactive Leaflet Map.

### 4.2. Subscription & Payment Workflow
1. **Selection:** User navigates to `/pricing` and clicks "Upgrade to PRO".
2. **Order Creation:** Backend (`paymentController.js`) creates an Order via Razorpay API and returns an `orderId`.
3. **Payment Execution:** Frontend opens Razorpay modal. User enters test card elements.
4. **Verification:** Razorpay returns payment identifiers + a signature array to Frontend, which forwards it to the Backend.
5. **Signature Validation:** Backend verifies the HMAC signature. If valid, upgrades the user's `subscription` field in the DB to "PRO" for 30 days and resets their monthly trip usage count.

---

## 5. Database Schema (Mongoose Models)

| Collection | Key Fields | Purpose |
|---|---|---|
| **Users** | `name, email, password, role, isVerified, subscription, monthlyTripCount` | Core user auth and SAAS management. |
| **Trips** | `user, destination, itinerary, images, sharedLinkToken, isShared` | Stores the AI generated trip output. |
| **Guides** | `user, location, bio, languages, hourlyRate` | Approved guides available in the marketplace. |
| **Videos** | `title, url, public_id, destination` | Cloudinary video assets mapped to destinations. |
| **Messages** | `sender, receiver, text, isTranslated` | Chat history between travelers and guides. |

---

## 6. API Architecture (Express Routes)

- **Authentication (`/api/auth`):** `/register`, `/login`, `/me`, `/forgotpassword`, `/resetpassword/:token`
- **Trips (`/api/trips`):** `GET /` (My Trips), `POST /` (Generate Trip), `GET /:id` (Trip Details)
- **Payments (`/api/payments`):** `POST /create-order`, `POST /verify-payment`
- **Explore Vids (`/api/explore`):** `GET /` (Fetch destination videos)
- **Admin (`/api/admin`):** `/analytics`, `/users`, `/applications`, `/videos`, `/users/:id/subscription`

*(Most non-public routes use a `protect` JWT verification middleware. Admin routes use an `adminOnly` layer).*

---

## 7. Security Best Practices Implemented
1. **JWT Authentication:** Stateful user session managed securely via Bearer Tokens in headers.
2. **Password Encryption:** Passwords hashed with Bcrypt (12 salt rounds) before DB insertion.
3. **Data Protection Filters:** Express-Validator to sanitize user input against NoSQL injections.
4. **Feature Gating Middleware:** Custom `checkSubscription('PRO')` backend middleware combined with a React `<FeatureGate>` higher-order component wrapping sensitive UI buttons.
5. **Secure Payment Verification:** Server-side HMAC-SHA256 signature verification guarantees nobody can brute-force the upgrade process.

---

## 8. Deployment Overview

- **Frontend Hosting:** Vercel / Netlify
  - Built using `vite build` to optimize static assets. Environment variables point `VITE_API_URL` to the live backend.
- **Backend Hosting:** Render / Heroku / AWS EC2
  - Deployed as a Node.js web service. Environment variables are injected directly into the hosting settings.
- **Database:** MongoDB Atlas (Cloud Cluster)
- **Media Asset Delivery:** Cloudinary CDN ensures massive video / image blobs do not slow down the Express server.
