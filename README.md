# VolunteerIQ – Smart Resource Allocation System

VolunteerIQ is a data-driven coordination system designed for NGOs and local organizations to efficiently manage community needs and allocate volunteers.

## Features
- **Multi-modal Data Collection**: Web forms, Voice-to-Text, and OCR-based document parsing.
- **AI-Powered Prioritization**: Uses Groq API (Llama 3) to analyze and categorize unstructured data.
- **Smart Matching Engine**: Optimized scoring algorithm based on skills, proximity (Haversine formula), urgency, and availability.
- **Real-time Admin Dashboard**: Visualized stats, heatmaps, and priority task lists.

---

## Step 6: Setup Instructions

### Prerequisites
- Node.js & npm
- MongoDB (Running locally or Atlas)
- Groq API Key (Get it from [console.groq.com](https://console.groq.com/))

### 1. Clone & Init
```bash
# Navigate to the project root
cd volunteer-iq
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# EDIT .env and add your MONGODB_URI and GROQ_API_KEY
```

### 3. Seed Data
```bash
node seedData.js
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
```

### 5. Run Application
Run backend:
```bash
# in backend/
npm start
```
Run frontend:
```bash
# in frontend/
npm start
```

---

## Step 7: Scaling Suggestions
- **ML Improvements**: Implement NLP models to detect and merge duplicate reports automatically.
- **AWS Deployment**: Host the backend on Lambda/App Runner and frontend on S3/CloudFront.
- **Offline Support**: Transform into a Progressive Web App (PWA) with service workers for field reports in low-connectivity areas.
- **Multilingual (i18n)**: Support for regional Indian languages (Hindi, Bengali, Tamil, etc.) for both UI and AI parsing.
- **SMS Integration**: Connect Twilio or Vonage for real-time SMS alerts to volunteers.
