/* ==========================================================================
   Wrench Wise EmployAI Seed & Configuration Repository
   ========================================================================== */

export const DEFAULT_PROGRAMS = [
    {
        id: "aiml",
        name: "AI/ML 7.0: Advanced Machine-Learning & Generative-AI Track",
        skills: [
            "Python", "NumPy", "Pandas", "Scikit-Learn", "TensorFlow", "PyTorch",
            "Generative AI", "Prompt Engineering", "LangChain", "Vector Databases",
            "MLOps", "MLflow", "Vertex AI", "Docker", "Git/GitHub"
        ],
        projects: [
            "Predictive Maintenance System",
            "GenAI Chatbot with LangChain",
            "AI Resume Analyzer API",
            "Customer Churn Pipeline",
            "Computer Vision Quality Inspection",
            "Recommendation Engine Core",
            "Deployed Industry AI Operating Platform"
        ],
        certifications: [
            "Wrench Wise AI/ML Certified Developer",
            "Advanced Generative AI & Agentic Systems Specialist",
            "Production MLOps Practitioner (Vertex AI)"
        ],
        learningOutcomes: [
            "Construct end-to-end scalable Machine Learning and Deep Learning pipelines",
            "Develop state-of-the-art Generative AI applications and Agentic Systems using LangChain and FAISS",
            "Version, track, and deploy production models on cloud platforms with modern MLOps (MLflow, Vertex AI, Docker)"
        ],
        essentialTools: ["Git", "GitHub", "MLOps Pipelines", "Vector Databases (Pinecone/Chroma)", "Weights & Biases / MLflow"],
        roles: [
            { title: "AI Engineer", requiredSkills: ["Python", "Machine Learning", "Deep Learning", "Generative AI", "LangChain"] },
            { title: "Machine Learning Engineer", requiredSkills: ["Python", "NumPy", "Pandas", "Machine Learning", "TensorFlow", "MLOps"] },
            { title: "Data Scientist", requiredSkills: ["Python", "NumPy", "Pandas", "Machine Learning", "Deep Learning"] },
            { title: "AI Developer", requiredSkills: ["Python", "Generative AI", "Prompt Engineering", "LangChain", "Vector Databases"] },
            { title: "GenAI Engineer", requiredSkills: ["Python", "Generative AI", "Prompt Engineering", "LangChain", "Vector Databases", "MLOps"] }
        ],
        projectDetails: {
            "Predictive Maintenance System": {
                desc: "Designed and implemented a real-time anomaly detection pipeline for manufacturing equipment sensors using Scikit-Learn, PyTorch, and Pandas. Deployed as a scalable endpoint on Vertex AI with drift alerts.",
                tech: "Python, PyTorch, Scikit-Learn, Pandas, Vertex AI"
            },
            "GenAI Chatbot with LangChain": {
                desc: "Developed a context-aware enterprise Generative AI Q&A chatbot using LangChain, OpenAI API, and Pinecone vector database. Integrated advanced semantic search, prompt templating, and prompt caching mechanisms.",
                tech: "Python, LangChain, Vector Databases, Generative AI"
            },
            "AI Resume Analyzer API": {
                desc: "Built a high-performance backend API service that extracts text from PDF resumes, performs column-aware layout reconstruction, and uses structured JSON schema LLM prompts for high-accuracy credential parsing.",
                tech: "Python, FastAPI, OpenAI API, Docker, Git/GitHub"
            },
            "Customer Churn Pipeline": {
                desc: "Constructed an automated customer churn prediction pipeline. Integrated feature engineering, model training, MLflow experiment tracking, and batch-inference scheduling on production clusters.",
                tech: "Python, Pandas, MLflow, Docker, TensorFlow"
            },
            "Computer Vision Quality Inspection": {
                desc: "Created a deep learning image classification model using PyTorch and OpenCV to automate visual quality inspection in assembly lines, achieving 98.4% accuracy.",
                tech: "Python, PyTorch, OpenCV, NumPy"
            },
            "Recommendation Engine Core": {
                desc: "Built a hybrid collaborative filtering and content-based recommendation service using TensorFlow Recommenders, optimizing content delivery for 50k+ active users.",
                tech: "Python, TensorFlow, Pandas, Scikit-Learn"
            },
            "Deployed Industry AI Operating Platform": {
                desc: "Final comprehensive capstone deploying multiple production-grade AI microservices into a unified Kubernetes cluster. Managed CI/CD pipelines, container orchestration, and MLflow model registries.",
                tech: "Python, Kubernetes, Docker, MLflow, Vertex AI, MLOps"
            }
        }
    },
    {
        id: "fullstack",
        name: "Full Stack 4.0: Certification Program in AI-Powered Full Stack Development",
        skills: [
            "HTML5", "CSS3", "JavaScript", "React", "Node.js", "Express.js",
            "MongoDB", "REST APIs", "Authentication (JWT)", "Docker",
            "Vercel/Netlify", "AI Integration"
        ],
        projects: [
            "Responsive Portfolio Website",
            "E-Commerce Platform with Stripe",
            "LMS Application with Video Streaming",
            "Collaborative Task Manager",
            "AI Chat & Semantic Search Portal",
            "Enterprise MERN Stack Capstone"
        ],
        certifications: [
            "Wrench Wise Certified Full Stack Developer",
            "AI-Assisted Web Applications Specialist",
            "Modern Cloud Deployment Practitioner"
        ],
        learningOutcomes: [
            "Design modern, fluid web frontends using React and robust Vanilla CSS custom properties",
            "Architect secure server backends using Node.js, Express, and JWT authentication",
            "Integrate advanced AI functionalities, LLM API calls, and cloud databases (MongoDB Atlas) into web apps"
        ],
        essentialTools: ["Git", "GitHub", "REST APIs", "Postman", "Cloud Deployment (AWS/Vercel)"],
        roles: [
            { title: "Software Engineer", requiredSkills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express.js", "MongoDB"] },
            { title: "Full Stack Developer", requiredSkills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express.js", "MongoDB", "REST APIs"] },
            { title: "Backend Developer", requiredSkills: ["JavaScript", "Node.js", "Express.js", "MongoDB", "REST APIs", "Authentication"] },
            { title: "Frontend Developer", requiredSkills: ["HTML", "CSS", "JavaScript", "React", "Deployment"] },
            { title: "AI Application Developer", requiredSkills: ["HTML", "CSS", "JavaScript", "React", "AI Integration", "Prompt Engineering"] }
        ],
        projectDetails: {
            "Responsive Portfolio Website": {
                desc: "Designed and deployed a highly fluid personal branding portfolio website using HTML5, CSS3 Custom Properties, and vanilla JavaScript. Optimized for SEO, speed, and mobile responsiveness.",
                tech: "HTML5, CSS3, JavaScript, Vercel/Netlify"
            },
            "E-Commerce Platform with Stripe": {
                desc: "Built a complete online e-commerce portal with user authentication, catalog management, MongoDB persistence, and a secure checkout pipeline using Stripe APIs and webhooks.",
                tech: "React, Node.js, Express.js, MongoDB, REST APIs"
            },
            "LMS Application with Video Streaming": {
                desc: "Developed a modular Learning Management System with user roles (instructors/students), course progression trackers, and cloud-hosted video streaming pipelines with secure JWT access.",
                tech: "React, Node.js, Express.js, MongoDB, Authentication (JWT)"
            },
            "Collaborative Task Manager": {
                desc: "Created a real-time task collaboration application using React and socket.io, featuring drag-and-drop kanban boards, instant push notifications, and team space access control.",
                tech: "React, Node.js, Express.js, MongoDB"
            },
            "AI Chat & Semantic Search Portal": {
                desc: "Architected a full stack web portal integrating LLM conversational capabilities and vector-based semantic search across site documents, optimizing context retention.",
                tech: "React, Node.js, Express.js, MongoDB, AI Integration"
            },
            "Enterprise MERN Stack Capstone": {
                desc: "Final 120-day enterprise full-stack program capstone. Built a highly secure, auto-scaling multi-tenant dashboard. Packed with logging, Jest unit testing, and deployed inside a Docker workflow.",
                tech: "React, Node.js, Express.js, MongoDB, Docker, Vercel/Netlify"
            }
        }
    }
];

export const DEFAULT_BENCHMARKS = {
    aiml: {
        skillsCount: 10,
        projectsCount: 5,
        portfolioRequired: true,
        githubRequired: true,
        certificationsCount: 2,
        experienceMonths: 6,
        brandingOptimized: true
    },
    fullstack: {
        skillsCount: 11,
        projectsCount: 5,
        portfolioRequired: true,
        githubRequired: true,
        certificationsCount: 2,
        experienceMonths: 6,
        brandingOptimized: true
    }
};

export const DEFAULT_SCORING_WEIGHTS = {
    projects: 25,
    skills: 25,
    portfolio: 10,
    experience: 10,
    certifications: 10,
    ats: 20
};

export const SAMPLE_RESUMES = [
    {
        id: "sample_weak_cs",
        name: "Rohan Sharma",
        email: "rohan.sharma2024@gmail.com",
        phone: "+91 98765 43210",
        linkedin: "linkedin.com/in/rohansharma-weak",
        github: "",
        portfolio: "",
        skills: ["HTML", "CSS", "Python (Basics)", "SQL"],
        projects: [
            {
                title: "Simple Calculator App",
                desc: "A basic calculator application developed using Python and Tkinter UI library.",
                tech: "Python, Tkinter"
            }
        ],
        experience: [
            {
                title: "Academic Summer Intern",
                company: "College IT Dept",
                duration: "1 Month (Summer 2024)",
                desc: "Helped manage network troubleshooting and desktop configuration for college laboratories."
            }
        ],
        certifications: [],
        hasInternship: true,
        hasWorkExperience: false,
        atsReadiness: 35
    },
    {
        id: "sample_switcher_mech",
        name: "Amit Patil",
        email: "amit.patil.mech@yahoo.com",
        phone: "+91 91234 56789",
        linkedin: "linkedin.com/in/amit-patil-mech",
        github: "github.com/amit-patil",
        portfolio: "",
        skills: ["AutoCAD", "MATLAB", "Python", "NumPy", "Pandas", "MS Excel"],
        projects: [
            {
                title: "Design of Heat Exchanger",
                desc: "Thermal analysis and design computation for a shell and tube heat exchanger using MATLAB.",
                tech: "MATLAB, AutoCAD"
            },
            {
                title: "Data Analysis of Climate Trends",
                desc: "Used Python and Pandas to analyze local meteorological datasets and plot temperature variances.",
                tech: "Python, Pandas, Matplotlib"
            }
        ],
        experience: [
            {
                title: "Graduate Engineer Trainee",
                company: "Precision Auto Components",
                duration: "9 Months (July 2023 - April 2024)",
                desc: "Supervised QA pipelines on assembly lines and generated production yield reports."
            }
        ],
        certifications: ["Introduction to Python Programming (Coursera)"],
        hasInternship: false,
        hasWorkExperience: true,
        atsReadiness: 48
    },
    {
        id: "sample_weak_web",
        name: "Sneha Nair",
        email: "snehanair.web@outlook.com",
        phone: "+91 88990 12345",
        linkedin: "linkedin.com/in/sneha-nair-dev",
        github: "github.com/sneha-nair",
        portfolio: "sneha-nair-portfolio.vercel.app",
        skills: ["HTML", "CSS", "JavaScript", "React (Basics)", "Node.js (Basics)"],
        projects: [
            {
                title: "Weather Search Application",
                desc: "A small web utility that pulls current temperature reports from a public weather REST API.",
                tech: "HTML, CSS, JavaScript"
            },
            {
                title: "Personal Portfolio Site",
                desc: "A responsive single page CV showcasing academic achievements and project links.",
                tech: "HTML, CSS, React"
            }
        ],
        experience: [],
        certifications: ["Web Development Bootcamp Completion"],
        hasInternship: false,
        hasWorkExperience: false,
        atsReadiness: 55
    }
];

export const INITIAL_COUNSELORS = [];

// Seed leads data over the last 30 days to build analytics
export const INITIAL_LEADS = [
    { id: "lead_001", name: "Aditya Roy", email: "adityaroy@gmail.com", program: "aiml", scoreBefore: 38, scoreAfter: 82, status: "Enrolled", counselorId: "sc_01", date: "2026-05-02" },
    { id: "lead_002", name: "Ananya Sen", email: "ananya.sen@gmail.com", program: "fullstack", scoreBefore: 51, scoreAfter: 88, status: "Enrolled", counselorId: "sc_01", date: "2026-05-05" },
    { id: "lead_003", name: "Karan Johar", email: "karan.j@gmail.com", program: "aiml", scoreBefore: 28, scoreAfter: 80, status: "Interested", counselorId: "sc_02", date: "2026-05-08" },
    { id: "lead_004", name: "Deepika P", email: "deepika.p@yahoo.com", program: "fullstack", scoreBefore: 42, scoreAfter: 86, status: "Highly Interested", counselorId: "sc_02", date: "2026-05-12" },
    { id: "lead_005", name: "Ranbir Kapoor", email: "ranbir.k@gmail.com", program: "aiml", scoreBefore: 47, scoreAfter: 83, status: "Needs Follow-Up", counselorId: "sc_03", date: "2026-05-15" },
    { id: "lead_006", name: "Alia Bhatt", email: "alia.b@outlook.com", program: "fullstack", scoreBefore: 30, scoreAfter: 84, status: "Enrolled", counselorId: "sc_02", date: "2026-05-18" },
    { id: "lead_007", name: "Varun Dhawan", email: "varun.d@gmail.com", program: "aiml", scoreBefore: 34, scoreAfter: 81, status: "Not Interested", counselorId: "sc_03", date: "2026-05-20" },
    { id: "lead_008", name: "Siddharth M", email: "sid.m@outlook.com", program: "fullstack", scoreBefore: 49, scoreAfter: 87, status: "Enrolled", counselorId: "sc_01", date: "2026-05-22" },
    { id: "lead_009", name: "Kiara Advani", email: "kiara.a@gmail.com", program: "aiml", scoreBefore: 40, scoreAfter: 82, status: "Highly Interested", counselorId: "sc_01", date: "2026-05-25" },
    { id: "lead_010", name: "Vicky Kaushal", email: "vicky.k@gmail.com", program: "fullstack", scoreBefore: 54, scoreAfter: 89, status: "Enrolled", counselorId: "sc_02", date: "2026-05-26" },
    { id: "lead_011", name: "Katrina Kaif", email: "katrina.k@yahoo.com", program: "aiml", scoreBefore: 32, scoreAfter: 81, status: "Needs Follow-Up", counselorId: "sc_03", date: "2026-05-28" },
    { id: "lead_012", name: "Sara Ali", email: "sara.ali@gmail.com", program: "fullstack", scoreBefore: 46, scoreAfter: 85, status: "Enrolled", counselorId: "sc_01", date: "2026-05-29" },
    { id: "lead_013", name: "Janhvi Kapoor", email: "janhvi.k@gmail.com", program: "aiml", scoreBefore: 39, scoreAfter: 83, status: "Interested", counselorId: "sc_02", date: "2026-05-30" },
    { id: "lead_014", name: "Ishaan Khatter", email: "ishaan.k@gmail.com", program: "fullstack", scoreBefore: 36, scoreAfter: 84, status: "Enrolled", counselorId: "sc_03", date: "2026-05-31" }
];
