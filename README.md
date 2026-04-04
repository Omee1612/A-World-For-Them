# 🐾 StrayPaws — Stray Animal Adoption & Vet Care Platform

A full-stack MERN application connecting stray animals with loving homes, featuring real-time chat, adoption management, and veterinary care booking.

---

## 📁 Project Structure

```
straypaws/
├── backend/
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/
│   │   ├── User.js              # User schema + bcrypt hashing
│   │   ├── Adoption.js          # Adoption post + request schemas
│   │   ├── VetAppointment.js    # Vet appointment schema
│   │   └── ChatRoom.js          # Chat room + messages schema
│   ├── routes/
│   │   ├── auth.js              # /api/auth - register, login, profile
│   │   ├── adoption.js          # /api/adoptions - CRUD, requests, respond
│   │   ├── vet.js               # /api/vet - appointments, available slots
│   │   ├── chat.js              # /api/chat - rooms, messages
│   │   └── user.js              # /api/users - public profiles
│   ├── .env.example
│   ├── package.json
│   └── server.js                # Express + Socket.IO entry point
│
├── frontend/
│   └── src/
│       ├── context/
│       │   └── AuthContext.js   # Auth state, axios instance, interceptors
│       ├── components/
│       │   └── layout/
│       │       ├── Navbar.js    # Sticky nav with user dropdown
│       │       └── Footer.js
│       ├── pages/
│       │   ├── HomePage.js      # Landing with hero, features, stats
│       │   ├── LoginPage.js     # Animated login with validation
│       │   ├── RegisterPage.js  # Multi-field register + password strength
│       │   ├── AdoptionPage.js  # Browse + filter adoption listings
│       │   ├── AdoptionDetailPage.js  # Detail + request + poster's manage panel
│       │   ├── PostAdoptionPage.js    # 3-step form to post a stray
│       │   ├── VetCarePage.js   # Appointment booking + history
│       │   ├── ChatPage.js      # Real-time chat with Socket.IO
│       │   └── DashboardPage.js # User dashboard with all activity
│       ├── App.js               # Router + protected routes
│       └── index.css            # Global styles, design tokens
│
├── package.json                 # Root scripts for concurrent dev
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
# Install all dependencies
npm run install-all
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/straypaws
JWT_SECRET=your_super_secret_key_here_make_it_long
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Cloudinary — sign up free at cloudinary.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Getting your Cloudinary credentials:
1. Sign up free at [cloudinary.com](https://cloudinary.com)
2. Go to your **Dashboard**
3. Copy **Cloud Name**, **API Key**, and **API Secret** into `.env`

That's it — the backend handles all uploads. Images are stored in Cloudinary under the `straypaws/adoptions/` folder, auto-compressed and served as WebP where supported.

### 3. Run in Development

```bash
# From the root directory — starts both backend and frontend
npm run dev
```

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

---

## ✨ Features

### 🔐 Authentication
- Secure JWT-based auth with bcrypt password hashing
- Persistent login with localStorage + auto token verification
- Protected routes, form validation with real-time feedback
- Password strength meter on registration

### 🐾 Adoption System
- Post stray animals with photos, health info, personality traits
- Filter by species, city, urgency level
- 3-step urgency system: Normal / Urgent / Critical
- Adoption request flow with poster accept/reject controls
- Automatic chat room creation on request

### 💬 Real-Time Chat
- Socket.IO powered live messaging
- Typing indicators
- Optimistic UI updates
- Chat sidebar with all active conversations
- Persistent message history

### 🏥 Vet Care
- 10 service types with pricing and duration
- Live slot availability checker
- Appointment management (book, view, cancel)
- Stray animal flag for reduced fee consideration
- Auto-assigned veterinarian

### 📊 Dashboard
- Overview stats
- Manage all posted animals
- Track adoption requests and statuses
- View and manage vet appointments
- Edit profile

---

## 🛠️ API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | ✓ | Get current user |
| PUT | `/api/auth/update-profile` | ✓ | Update profile |
| GET | `/api/adoptions` | — | List adoptions (with filters) |
| POST | `/api/adoptions` | ✓ | Create adoption post |
| GET | `/api/adoptions/:id` | — | Get adoption detail |
| PUT | `/api/adoptions/:id` | ✓ | Update own post |
| DELETE | `/api/adoptions/:id` | ✓ | Delete own post |
| POST | `/api/adoptions/:id/request` | ✓ | Request to adopt |
| PUT | `/api/adoptions/:id/request/:rId/respond` | ✓ | Accept/Reject request |
| PUT | `/api/adoptions/:id/complete` | ✓ | Mark as adopted |
| GET | `/api/adoptions/my-posts` | ✓ | Own posts |
| GET | `/api/adoptions/my-requests` | ✓ | Own requests |
| GET | `/api/vet/services` | — | List services & vets |
| GET | `/api/vet/available-slots?date=` | — | Check slot availability |
| POST | `/api/vet/book` | ✓ | Book appointment |
| GET | `/api/vet/my-appointments` | ✓ | Own appointments |
| PUT | `/api/vet/:id/cancel` | ✓ | Cancel appointment |
| GET | `/api/chat/my-rooms` | ✓ | All chat rooms |
| GET | `/api/chat/:roomId` | ✓ | Get chat + messages |
| POST | `/api/chat/:roomId/message` | ✓ | Send message |

---

## 🎨 Design System

- **Primary**: Terracotta `#c4633a`
- **Accent**: Ochre `#d4882c`
- **Nature**: Forest green `#3d6b4f`
- **Base**: Warm cream `#fdf6ec`
- **Fonts**: Playfair Display (headings) + DM Sans (body)

---

## 📦 Tech Stack

**Backend**: Express.js, Mongoose, Socket.IO, JWT, bcryptjs, express-validator  
**Frontend**: React 18, React Router v6, Axios, Socket.IO Client, React Hot Toast, date-fns
