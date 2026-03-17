# 🌍 AI Powered Smart Tourism Platform

A full-stack MERN application with AI-powered trip planning, guide marketplace, travel video explorer, chatbot, PDF export, weather, and admin dashboard.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Vite + Tailwind CSS v3 |
| Backend | Node.js + Express.js (MVC) |
| Database | MongoDB + Mongoose |
| Auth | JWT + Bcrypt |
| AI | Google Gemini API (free tier) |
| Images | Unsplash API (free tier) |
| Maps | Leaflet.js + OpenStreetMap |
| Weather | OpenWeather API (free tier) |
| Videos | Cloudinary (free tier) |
| Email | Nodemailer (Gmail SMTP) |
| PDF | PDFKit |
| Scheduler | node-cron |

---

## 📁 Project Structure

```
AI_TOURISM_WEBSIT/
├── server/
│   ├── config/         # DB connection
│   ├── controllers/    # authController, tripController, guideController, chatController, adminController
│   ├── middlewares/    # authMiddleware (JWT, admin, guide)
│   ├── models/         # User, Trip, Guide, GuideApplication, GuideRequest, ChatMessage, Video, Reminder
│   ├── routes/         # authRoutes, tripRoutes, guideRoutes, chatRoutes, adminRoutes, weatherRoutes, exploreRoutes
│   ├── services/       # geminiService, unsplashService, weatherService, cloudinaryService, emailService
│   ├── utils/          # reminderScheduler (node-cron)
│   └── index.js        # Express entry point
└── client/
    ├── src/
    │   ├── context/    # AuthContext
    │   ├── pages/      # 14 pages
    │   ├── components/ # Navbar
    │   └── services/   # api.js (Axios)
    └── vite.config.js
```

---

## ⚙️ Step 1 — Install Dependencies

### Backend
```bash
cd server
npm install
```

### Frontend
```bash
cd client
npm install
```

---

## 🔑 Step 2 — Configure Environment Variables

### Backend: Create `server/.env`

Copy from `server/.env.example` and fill in all values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ai_tourism

JWT_SECRET=your_strong_jwt_secret_here
JWT_EXPIRE=7d

# Gmail SMTP (create App Password at myaccount.google.com/apppasswords)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_16_char_app_password

# Google Gemini (get from aistudio.google.com)
GEMINI_API_KEY=your_gemini_key

# Unsplash (get from unsplash.com/developers)
UNSPLASH_ACCESS_KEY=your_unsplash_key

# Cloudinary (get from cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OpenWeather (get from openweathermap.org/api)
OPENWEATHER_API_KEY=your_key

CLIENT_URL=http://localhost:5173
```

### Frontend: `client/.env` (already created)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔑 Step 3 — Get API Keys

| Service | URL | Notes |
|---|---|---|
| **MongoDB Atlas** | [mongodb.com/atlas](https://www.mongodb.com/atlas) | Free M0 tier — get connection URI |
| **Google Gemini** | [aistudio.google.com](https://aistudio.google.com) | Free API key |
| **Unsplash** | [unsplash.com/developers](https://unsplash.com/developers) | Create app → get Access Key |
| **Cloudinary** | [cloudinary.com](https://cloudinary.com) | Free 25GB — get Cloud Name, API Key, API Secret |
| **OpenWeather** | [openweathermap.org/api](https://openweathermap.org/api) | Free tier 60 calls/min |
| **Gmail SMTP** | [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) | Enable 2FA first, then create App Password |

---

## 🆕 Step 4 — Create Admin User

After registering your first account, open MongoDB Compass or Atlas and set:
```
db.users.updateOne({ email: "your@email.com" }, { $set: { isAdmin: true, isVerified: true } })
```

---

## 🖥️ Step 5 — Run the Application

### Terminal 1 — Backend
```bash
cd server
npm run dev
# Server runs at: http://localhost:5000
```

### Terminal 2 — Frontend
```bash
cd client
npm run dev
# App runs at: http://localhost:5173
```

---

## ✅ Step 6 — Test Major Features

1. **Auth**: Sign up → receive verification email → login → reset password
2. **AI Trip**: Login → "Create Trip" → fill form → wait ~10s for Gemini → view itinerary with map & weather
3. **PDF**: On trip detail page → click "Download PDF" → get formatted itinerary
4. **Explore**: Visit `/explore` → watch demo videos (admin must upload first)
5. **Guides**: Visit `/guides` → browse guides → request guide → chat with guide (messages auto-translated)
6. **Admin**: Login as admin → visit `/admin` → approve guide applications, upload videos, view analytics
7. **Chatbot**: Visit `/chatbot` → ask travel questions (powered by Gemini)

---

## 🌐 Step 7 — Deploy

### Backend (Render.com - Free)
1. Push `server/` to GitHub
2. Create new Web Service on [render.com](https://render.com)
3. Add all environment variables from `.env`
4. Build Command: `npm install` · Start Command: `npm start`

### Frontend (Vercel - Free)
1. Push `client/` to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Set `VITE_API_URL=https://your-render-app.onrender.com/api`
4. Deploy

---

## 📋 API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Private | Get profile |
| POST | `/api/trips` | Private | Generate AI trip |
| GET | `/api/trips` | Private | My trips |
| GET | `/api/trips/:id` | Private | Trip detail |
| GET | `/api/trips/:id/pdf` | Private | Download PDF |
| POST | `/api/trips/chatbot` | Private | AI chatbot |
| GET | `/api/guides` | Public | Browse guides |
| POST | `/api/guides/apply` | Private | Apply as guide |
| POST | `/api/chat/send` | Private | Send message (+ translate) |
| GET | `/api/chat/:userId` | Private | Get conversation |
| GET | `/api/weather/:city` | Public | Weather data |
| GET | `/api/explore` | Public | Travel videos |
| GET | `/api/admin/analytics` | Admin | Platform stats |
| GET | `/api/admin/applications` | Admin | Guide applications |
| PUT | `/api/admin/applications/:id/approve` | Admin | Approve guide |
| POST | `/api/admin/videos` | Admin | Upload video |

---

## 🔒 Security Notes
- Passwords hashed with bcrypt (12 rounds)
- JWT tokens expire in 7 days
- Admin routes protected with role middleware
- File uploads validated (video/image only, 100MB max)
- CORS restricted to CLIENT_URL

---

*Built with ❤️ — MERN Stack + Google Gemini AI*
