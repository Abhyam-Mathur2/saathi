# Saathi - Community Volunteer Coordination Platform

A comprehensive web-based platform designed to connect volunteers with community needs efficiently. Saathi enables seamless coordination between administrators, volunteers, and citizens to address urgent community issues through intelligent matching and real-time communication.

---

## 🌟 Core Features

### 1. **Role-Based Access Control**
**Description**: The platform operates on three distinct user roles, each with tailored dashboards and capabilities.

- **Admin Dashboard**: 
  - Manage all volunteers and reports
  - View comprehensive analytics and statistics
  - Monitor urgent tasks and assignments
  - Access system-wide insights with data visualization
  - Control report statuses and volunteer assignments

- **Volunteer Portal**: 
  - View assigned tasks and urgent reports nearby
  - Accept/decline matches based on skills and availability
  - Track personal assignments and history
  - Communicate directly with citizens

- **Citizen Portal**: 
  - Submit community reports and needs
  - Track report status in real-time
  - Receive updates on volunteer assignments
  - Option to become a volunteer (Citizen-to-Volunteer conversion)

---

### 2. **Intelligent Report Management**
**Description**: Citizens can submit detailed community issues that are automatically processed and categorized using AI.

**Key Capabilities**:
- Submit reports with description, issue type, and location
- Attach images and detailed information
- Automatic categorization using Groq AI (Llama 3.1-8b)
- Real-time status updates (Pending → Assigned → In Progress → Completed)
- Urgency classification (Critical, High, Medium, Low)
- Location-based pinning on interactive maps

---

### 3. **Smart Volunteer Matching Engine**
**Description**: Automatically matches volunteers to reports based on multiple criteria for optimal resource allocation.

**Matching Algorithm Factors**:
- **Skill Matching**: Volunteers matched to reports requiring their specific skills
- **Proximity Scoring**: Uses Haversine formula to calculate distance between volunteer and report location
- **Urgency Weighting**: Prioritizes high-urgency reports for quick assignment
- **Availability Check**: Ensures volunteers are available for the assigned timeframe
- **Historical Performance**: Considers volunteer rating and past completion records

**Outcome**: Administrators see ranked volunteer recommendations for each report, reducing manual effort and improving assignment accuracy.

---

### 4. **AI-Powered Chatbot (Multi-Role)**
**Description**: An intelligent conversational assistant available to all user roles with context-aware responses.

**Role-Specific Assistants**:
- **Admin Chatbot**: Assists with volunteer management, report analysis, statistics, and operational coordination
- **Volunteer Chatbot**: Helps with task clarification, matching questions, availability management, and action steps
- **Citizen Chatbot**: Explains report process, assists with report submission, and provides guidance in simple language

**Features**:
- Powered by Groq's Llama 3.1-8b (100x faster than alternatives)
- Multi-language support: English, Hindi, Tamil, Marathi, Bengali, Telugu, Kannada, Malayalam, Gujarati, Punjabi
- Context-aware responses maintaining conversation history
- Available as persistent chat widget across all pages

---

### 5. **WhatsApp Communication Integration**
**Description**: Direct WhatsApp messaging between volunteers and citizens for quick coordination.

**Capabilities**:
- Send WhatsApp messages to volunteers via Twilio API
- Direct message opening for quick response
- Support for Indian phone numbers with automatic normalization
- Real-time message delivery status
- Two-way communication for urgent coordination
- Integration with both volunteer and citizen interfaces
- Incoming WhatsApp webhook support for guided report registration
- Conversational commands support (`START`, `HELP`, `RESET`, `CANCEL`)
- AI fallback parsing for single free-text WhatsApp reports

**Use Cases**:
- Urgent task notifications to volunteers
- Citizens reaching out to assigned volunteers
- Quick clarifications before task assignment
- Real-time status updates during volunteer work

---

### 6. **Real-Time Admin Dashboard**
**Description**: Comprehensive visualization and analytics for administrative oversight.

**Dashboard Components**:
- **Key Metrics**:
  - Total Volunteers registered
  - Total Reports submitted
  - Assignments completed
  - Average response time

- **Visual Analytics**:
  - Line charts showing report trends over time
  - Pie charts for issue type distribution
  - Urgency status breakdown (critical/high/medium/low)
  - Volunteer specialization breakdown

- **Geographic Visualization**:
  - Interactive heatmap showing report hotspots
  - Location-based volunteer distribution
  - Coverage analysis across service areas

- **Urgent Tasks List**:
  - Real-time filtering of high-priority reports
  - Quick-action assignment interface
  - Status update capabilities
  - Volunteer availability indicators

---

### 7. **Volunteer Directory & Registration**
**Description**: Streamlined volunteer onboarding and management system.

**Registration Features**:
- Detailed volunteer profile creation
- Skills selection and specialization
- Location and service area configuration
- Availability scheduling
- Profile image upload for identification
- Performance history tracking

**Directory Features**:
- Search volunteers by skills
- Filter by location and availability
- View volunteer ratings and completion history
- Check individual assignment history
- Monitor volunteer activity patterns

---

### 8. **Citizen-to-Volunteer Conversion**
**Description**: Enable citizens to upgrade their role and become active volunteers within the platform.

**Process**:
- "Become a Volunteer" button in Citizen Portal
- Seamless transition to Volunteer Registration
- Maintain existing citizen profile data
- Dual-role capability for community members
- Enhanced permissions after conversion

**Benefits**:
- Expands volunteer pool organically
- Leverages citizen feedback to identify new volunteers
- Maintains community trust through familiar transition
- Encourages community participation

---

### 9. **Notification System**
**Description**: Real-time alerts for important events and status changes.

**Notification Types**:
- Report submission confirmation
- Assignment notifications to volunteers
- Status update alerts to citizens
- Task completion notifications
- Urgent escalation alerts
- System notifications for admins

**Delivery Methods**:
- In-app toast notifications
- WhatsApp messages (for critical updates)
- Email notifications (extensible)
- Real-time badge updates on navbar

---

### 10. **Data Persistence with MongoDB**
**Description**: Robust cloud database integration for reliable data storage.

**Features**:
- MongoDB Atlas cloud database
- Mongoose ODM for structured data models
- Automatic schema validation
- Connection retry logic
- Data backup and recovery
- Scalable architecture for growth

**Data Models**:
- **Volunteers**: Profile, skills, location, availability, ratings
- **Reports**: Details, status, location, urgency, assignments
- **Citizens**: Profile, contact, submitted reports, status
- **Assignments**: Volunteer-to-report mapping, status, completion tracking

---

### 11. **Responsive Web Design**
**Description**: Fully responsive interface that works seamlessly across all devices.

**Design Framework**: Tailwind CSS for modern, consistent styling
- Mobile-first responsive layout
- Tablet and desktop optimization
- Touch-friendly components
- Dark mode support
- Consistent brand identity (Saathi)

**User Experience**:
- Intuitive navigation flow
- Clear role-based navigation menu
- Fast page load times
- Accessible design (WCAG compliant)
- Smooth animations and transitions

---

### 12. **Authentication & Session Management**
**Description**: Secure user authentication with role-based access control.

**Features**:
- Separate admin and volunteer/citizen authentication flows
- Secure credential storage (password-protected)
- Session persistence with localStorage
- Role-based navigation filtering
- Logout with session cleanup
- Legacy credential migration support

**Demo Credentials**:
- Admin: `admin@saathi.com` / `Saathi@Admin2026!`
- Demo Volunteer: `john@saathi.com` / `Volunteer@2026`
- Demo Citizen: `citizen_demo` / `Citizen@2026`
- Volunteers & Citizens can also self-register on respective portals

---

### 13. **Error Handling & Fallback System**
**Description**: Graceful error management with fallback mechanisms for reliability.

**Features**:
- API error handling with user-friendly messages
- MongoDB connection fallback to local storage
- Circuit breaker for external APIs (Groq, Twilio)
- Comprehensive logging for debugging
- Automatic retry on transient failures
- Fallback storage for uninterrupted service

---

### 14. **Unstructured Data Processing**
**Description**: Transform raw, unstructured data into actionable intelligence.

**Capabilities**:
- Parse free-form report descriptions using AI
- Extract key information (what, where, when, who)
- Auto-categorize issues into predefined types
- Identify urgency levels from text analysis
- Generate action-ready summaries for volunteers

**AI Processing**:
- Uses Groq's Llama 3.1-8b model
- Sub-second response time
- Context-aware categorization
- Consistency across multiple languages

---

### 15. **AI Auto-Planner & Dispatch Automation**
**Description**: Automatically generates daily volunteer-task assignment plans from pending reports and available volunteers.

**Capabilities**:
- Auto-plans from pending reports with urgency-aware prioritization
- Filters assignments by volunteer availability and nearby task radius
- Persists generated assignments and updates report statuses
- Generates volunteer-specific assignment views
- Supports latest-plan retrieval and manual reassignment trigger endpoint
- PDF export of generated plans from the frontend

---

### 16. **Route Planning & Optimization**
**Description**: Computes optimized volunteer routes to reduce travel time and improve field productivity.

**Capabilities**:
- Nearest-neighbor route optimization fallback using Haversine distance
- Optional Google Maps Directions API enhancement when API key is available
- Distance and time estimation with per-task service time buffering
- Volunteer route persistence with ordered route points
- Route visualization on interactive maps in the Route Planner page

---

### 17. **Impact Zones, Heatmap & Crisis Prediction**
**Description**: Displays impact hotspots and predicts near-term crisis urgency using zone-level signals.

**Capabilities**:
- Interactive impact heatmap using zone urgency and severity
- AI prediction endpoint for next-7-day urgency, crisis type, skill recommendations, and confidence
- Satellite/weather risk endpoint for location-level risk score and alert level
- Critical-zone alerting in UI with ranked zone cards
- Scheduled impact score updates through background cron jobs

---

### 18. **Multimodal Report Submission**
**Description**: Supports multiple intake methods to capture incidents quickly and accurately.

**Capabilities**:
- Standard structured form with issue type and urgency slider
- Browser geolocation capture with reverse geocoding fallback
- Voice-to-text capture via Web Speech API
- Image upload with OCR text extraction (Tesseract.js)
- Unstructured WhatsApp/SMS-style text parsing through AI
- Unified backend report creation for structured and unstructured inputs

---

### 19. **Resilient Data Layer (Cloud + Local Fallback)**
**Description**: Ensures core flows remain functional even when MongoDB is unavailable.

**Capabilities**:
- Primary MongoDB persistence through Mongoose models
- Automatic local JSON store fallback for reports, volunteers, and assignments
- Seeded local demo data for quick startup and testing
- Shared query/aggregation helpers working across MongoDB and fallback mode
- Runtime Mongo readiness checks for graceful behavior switching

---

### 20. **Demo Bootstrap & Legacy Session Compatibility**
**Description**: Improves onboarding and continuity with seeded demo accounts and migration-friendly session logic.

**Capabilities**:
- Auto-seeding of volunteer and citizen demo accounts on app startup
- One-time seeding guard to avoid overwriting existing user data
- Legacy localStorage key compatibility for session continuity
- Role-aware session save/read/logout helpers for admin, volunteer, and citizen flows

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React (Create React App)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Maps**: Leaflet
- **Charts**: Recharts
- **Routing**: React Router

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **AI/LLM**: Groq API (Llama 3.1-8b)
- **SMS/WhatsApp**: Twilio
- **Environment**: dotenv for configuration

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas
- **API**: RESTful architecture

---

## 📊 API Endpoints

### Volunteer Management
- `GET /api/volunteers` - List all volunteers
- `POST /api/volunteers` - Register new volunteer
- `DELETE /api/volunteers/:id` - Remove volunteer

### Report Management
- `GET /api/reports` - List all reports
- `POST /api/reports` - Submit new report
- `GET /api/reports/match/:reportId` - Get top volunteer matches for a report

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### AI Services
- `POST /api/chatbot/respond` - Chat with AI assistant
- `POST /api/whatsapp/send` - Send outbound WhatsApp message
- `POST /api/whatsapp/webhook` - Receive inbound WhatsApp events

### Impact & Prediction
- `GET /api/impact/heatmap` - Fetch impact zones for map view
- `GET /api/impact/predict/:zoneId` - Generate AI prediction for a zone
- `GET /api/impact/satellite/:lat/:lng` - Fetch weather-based risk signals

### Route Optimization
- `GET /api/routes/volunteer/:volunteerId` - Fetch saved optimized route for a volunteer
- `POST /api/routes/optimize-all` - Trigger/return route optimization output
- `GET /api/routes/cluster/:zoneId` - Zone route clustering endpoint

### Auto-Planner
- `POST /api/planner/run` - Run AI auto-planner
- `GET /api/planner/latest` - Fetch latest generated plan
- `GET /api/planner/volunteer/:id` - Fetch volunteer-specific assignment from latest plan
- `PUT /api/planner/reassign` - Reassignment endpoint

---

## 🚀 Deployment Guide

### Frontend Deployment (Vercel)
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Set environment variable: `REACT_APP_API_BASE_URL`
4. Deploy automatically on push

### Backend Deployment (Render)
1. Create new service on Render
2. Connect GitHub repository
3. Set environment variables:
   - `MONGODB_URI` - MongoDB connection string
   - `GROQ_API_KEY` - Groq API key
   - `TWILIO_ACCOUNT_SID` - Twilio account ID
   - `TWILIO_AUTH_TOKEN` - Twilio auth token
   - `TWILIO_WHATSAPP_NUMBER` - Twilio WhatsApp number
4. Set start command: `npm start`
5. Deploy and monitor logs

---

## 📋 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account
- Groq API key
- Twilio account (optional, for WhatsApp)

### Local Development Setup

**Backend Setup**:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

**Frontend Setup**:
```bash
cd frontend
npm install
npm start
```

Access application at `http://localhost:3000`

---

## 🔐 Security Features

- **Authentication**: Role-based access control
- **Data Validation**: Input validation on all endpoints
- **CORS**: Configured for cross-origin requests
- **Error Handling**: Sanitized error messages
- **Environment Variables**: Sensitive data in .env files
- **API Rate Limiting**: Planned for production

---

## 📈 Future Enhancements

- Two-factor authentication
- Advanced analytics and reporting
- Mobile app (React Native)
- SMS notifications (beyond WhatsApp)
- Volunteer training modules
- Performance incentive system
- Community impact metrics
- Integration with donation platforms

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 📞 Support

For issues, feature requests, or questions:
- Create an issue on GitHub
- Contact: support@saathi.com
- Documentation: [Link to wiki/docs]

---

## 🙏 Acknowledgments

- **Groq** for powerful AI capabilities
- **Twilio** for WhatsApp integration
- **MongoDB Atlas** for database services
- **Render** and **Vercel** for hosting platforms
- All volunteers and contributors

---

## 📦 Project Status

**Current Version**: 2.0.0 (Saathi)
**Status**: Production Ready
**Last Updated**: April 2026

---

*Saathi - Connecting Communities with Volunteers for Positive Change*
