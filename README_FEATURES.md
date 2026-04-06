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
- Volunteers & Citizens: Self-registration on respective portals

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
- `GET /api/volunteers/:id` - Get volunteer details
- `PUT /api/volunteers/:id` - Update volunteer profile

### Report Management
- `GET /api/reports` - List all reports
- `POST /api/reports` - Submit new report
- `GET /api/reports/:id` - Get report details
- `PUT /api/reports/:id` - Update report status

### Assignments
- `GET /api/assignments` - View assignments
- `POST /api/assignments` - Create assignment
- `PUT /api/assignments/:id` - Update assignment status

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/heatmap` - Get location heatmap data
- `GET /api/dashboard/urgent` - Get urgent tasks

### AI Services
- `POST /api/chat` - Chat with AI assistant
- `POST /api/whatsapp/send` - Send WhatsApp message

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
