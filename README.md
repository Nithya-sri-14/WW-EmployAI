# Wrench Wise EmployAI

Wrench Wise EmployAI is an advanced, AI-powered employability assessment and career transformation platform. It empowers sales counselors and administrators to upload candidate resumes, automatically parse their skills using Google's Gemini LLM, evaluate them against configurable industry benchmarks, and generate actionable "career transformation" blueprints.

## ✨ Key Features

- **🔒 Secure Role-Based Access**
  - **Admin Portal**: A secure system configuration panel (`computerscience@wrenchwise.com`) to manage scoring weights, industry benchmarks, curriculum programs, and counselor accounts.
  - **Counselor Portal**: An elegant dashboard for counselors to process leads, assess resumes, and track candidate growth.

- **🧠 AI-Powered Resume Parsing**
  - Direct integration with Google's Gemini AI to intelligently extract skills, education, and experience from raw text, DOCX, or PDF resumes.
  - Advanced fallback mechanisms utilizing `pdf.js` and `mammoth.js` for local document parsing.

- **📊 Dynamic Scoring & Benchmarks**
  - Candidates are scored dynamically across multiple categories (Hard Skills, Soft Skills, Experience, Certifications).
  - Configurable benchmarks for targeted programs (e.g., *AI/ML Engineering* or *Full Stack Development*).

- **📈 Visual Analytics & Transformation Blueprints**
  - Generates comprehensive visual reports comparing the candidate's original profile against their projected post-program transformation.
  - One-click PDF export functionality to share branded reports with candidates.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Haritha1210/WrenchWiseEmployeeAI.git
   cd WrenchWiseEmployeeAI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory based on `.env.example`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

4. **Run the local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.


## ☁️ Deployment

This platform is configured for seamless deployment on both **Vercel** and **Render**.
- **Vercel**: A `vercel.json` file is included to properly route the serverless API functions (`/api/get-gemini-key`) while securely serving the static frontend assets.
- **Render**: The included `server.js` and `render.yaml` files ensure the Node/Express backend properly serves the SPA and securely manages environment variables.

## 🛠 Tech Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript (ES Modules), Chart.js, Lucide Icons, html2pdf.js
- **Backend / API**: Node.js, Express, Vercel Serverless Functions
- **AI Integration**: Google Gemini API (@google/genai)
