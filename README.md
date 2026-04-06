# Saathi - Community Volunteer Coordination Platform

A comprehensive web-based platform designed to connect volunteers with community needs efficiently. Saathi enables seamless coordination between administrators, volunteers, and citizens to address urgent community issues through intelligent matching and real-time communication.

---

## 🌟 Core Features

### 1. **Role-Based Access Control**
- **Admin Dashboard**: Manage volunteers, reports, and view analytics
- **Volunteer Portal**: View assignments, track tasks, and communicate with citizens
- **Citizen Portal**: Submit reports, track status, and upgrade to volunteer role

### 2. **Intelligent Report Management**
- Citizens submit community issues with descriptions and locations
- Automatic AI categorization and urgency classification
- Real-time status tracking (Pending → Assigned → In Progress → Completed)
- Location-based pinning on interactive maps

### 3. **Smart Volunteer Matching Engine**
- Matches volunteers based on skills, proximity (Haversine formula), urgency, and availability
- Ranked recommendations for optimal resource allocation
- Historical performance consideration

### 4. **AI-Powered Chatbot (Multi-Role)**
- Groq Llama 3.1-8b powered conversational AI
- Role-specific assistants (Admin, Volunteer, Citizen)
- Multi-language support: 10+ languages including Hindi, Tamil, Marathi, Bengali, etc.
- Context-aware responses with conversation history

### 5. **WhatsApp Communication**
- Direct WhatsApp messaging via Twilio integration
- Send urgent notifications to volunteers
- Two-way communication for quick coordination
- Support for Indian phone numbers

### 6. **Real-Time Admin Dashboard**
- Key metrics: Volunteers, Reports, Assignments, Response times
- Visual analytics: Charts, pie graphs, urgency breakdowns
- Geographic heatmap showing report hotspots
- Urgent tasks list with quick-action interface

### 7. **Volunteer Directory & Registration**
- Detailed volunteer profiles with skills and specialization
- Availability scheduling and location configuration
- Performance rating and history tracking
- Advanced search and filtering capabilities

### 8. **Citizen-to-Volunteer Conversion**
- Citizens can upgrade to volunteer role seamlessly
- Maintain existing profile data during conversion
- Expand volunteer pool organically

### 9. **Real-Time Notifications**
- In-app toast notifications for important events
- WhatsApp alerts for critical updates
- Status change notifications to all stakeholders
- Real-time badge updates on navbar

### 10. **Data Persistence with MongoDB**
- MongoDB Atlas cloud database integration
- Mongoose ODM for structured data models
- Automatic schema validation and backup support
- Scalable architecture for growth

### 11. **Responsive Web Design**
- Fully responsive across mobile, tablet, and desktop
- Tailwind CSS for modern, consistent styling
- Touch-friendly components with smooth animations
- Fast page load times and accessibility support

### 12. **Unstructured Data Processing**
- Parse free-form report descriptions using AI
- Auto-categorize issues into predefined types
- Extract key information automatically
- Identify urgency levels from text analysis

---

## 🛠️ Technology Stack

**Frontend**: React, Tailwind CSS, Lucide Icons, Axios, React Hot Toast, Leaflet, Recharts
**Backend**: Node.js, Express.js, MongoDB, Mongoose, Groq API, Twilio
**Deployment**: Vercel (Frontend), Render (Backend), MongoDB Atlas (Database)

---

## 🚀 Quick Start

### Prerequisites
- Node.js v14+ and npm
- MongoDB Atlas account
- Groq API key from [console.groq.com](https://console.groq.com/)
- (Optional) Twilio account for WhatsApp

### Installation

**Backend Setup**:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials (MONGODB_URI, GROQ_API_KEY, etc.)
npm start
```

**Frontend Setup**:
```bash
cd frontend
npm install
npm start
```

Access the application at `http://localhost:3000`

### Seed Data
```bash
cd backend
node seedData.js
```

### Demo Credentials
- **Admin**: `admin@saathi.com` / `Saathi@Admin2026!`
- **Volunteers & Citizens**: Register on respective portals

---

## 📋 Project Structure

```
saathi/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components (Dashboard, Portal, etc.)
│   │   ├── utils/            # Utility functions (auth, API config)
│   │   └── index.js          # Entry point
│   └── package.json
├── backend/                  # Node.js Express backend
│   ├── controllers/          # Request handlers
│   ├── models/               # MongoDB schema models
│   ├── routes/               # API routes
│   ├── services/             # Business logic (Groq, matching, etc.)
│   ├── middleware/           # Custom middleware
│   ├── server.js             # Express server
│   └── package.json
└── README.md                 # This file
```

---

## 🌐 API Endpoints

**Volunteers**: GET/POST `/api/volunteers`, GET/PUT `/api/volunteers/:id`
**Reports**: GET/POST `/api/reports`, GET/PUT `/api/reports/:id`
**Assignments**: GET/POST `/api/assignments`, PUT `/api/assignments/:id`
**Dashboard**: GET `/api/dashboard/stats`, GET `/api/dashboard/heatmap`
**Chat**: POST `/api/chat`
**WhatsApp**: POST `/api/whatsapp/send`

---

## 🔐 Security Features

- Role-based access control with session management
- Input validation on all API endpoints
- CORS configuration for secure cross-origin requests
- Sensitive data stored in environment variables
- Error handling with sanitized messages
- MongoDB connection with retry logic

---

## 📈 Deployment

**Frontend (Vercel)**:
1. Push to GitHub and connect to Vercel
2. Set `REACT_APP_API_BASE_URL` environment variable
3. Auto-deploys on push

**Backend (Render)**:
1. Connect GitHub repository to Render
2. Set environment variables: `MONGODB_URI`, `GROQ_API_KEY`, Twilio credentials
3. Set start command: `npm start`
4. Deploy and monitor logs

---

## 📚 For More Details

See **README_FEATURES.md** for comprehensive documentation of all features with detailed explanations.

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **Groq** for powerful AI capabilities
- **Twilio** for WhatsApp integration
- **MongoDB Atlas** for database services
- **Render** and **Vercel** for hosting

---

*Saathi - Connecting Communities with Volunteers for Positive Change*
