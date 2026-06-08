/* ==========================================================================
   Wrench Wise EmployAI Transformation & Future Employability Engine
   ========================================================================== */

import { calculateComponentScores, evaluateEmployability } from './scoring.js';
import { calculateAtsFromProfile } from './parser.js';
import { getStorageItem } from '../utils.js';

// Pre-defined role-skill mappings for calculations
const ROLE_SKILLS = {
    // AI/ML Roles
    "AI Engineer": ["Python", "Machine Learning", "Deep Learning", "Generative AI", "LangChain"],
    "Machine Learning Engineer": ["Python", "NumPy", "Pandas", "Machine Learning", "TensorFlow", "MLOps"],
    "Data Scientist": ["Python", "NumPy", "Pandas", "Machine Learning", "Deep Learning"],
    "AI Developer": ["Python", "Generative AI", "Prompt Engineering", "LangChain", "Vector Databases"],
    "GenAI Engineer": ["Python", "Generative AI", "Prompt Engineering", "LangChain", "Vector Databases", "MLOps"],
    
    // Full Stack Roles
    "Software Engineer": ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express.js", "MongoDB"],
    "Full Stack Developer": ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express.js", "MongoDB", "REST APIs"],
    "Backend Developer": ["JavaScript", "Node.js", "Express.js", "MongoDB", "REST APIs", "Authentication"],
    "Frontend Developer": ["HTML", "CSS", "JavaScript", "React", "Deployment"],
    "AI Application Developer": ["HTML", "CSS", "JavaScript", "React", "AI Integration", "Prompt Engineering"]
};

// Pre-defined project descriptions and tools for authentic transformation reporting
const PROJECT_DETAILS = {
    // AI/ML 7.0 Projects
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
    },

    // Full Stack 4.0 Projects
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
};

/**
 * Generates a fully transformed future candidate profile based on program completion.
 * @param {Object} candidate - Original parsed candidate
 * @param {Object} program - Selected program metadata
 * @returns {Object} Transformed future candidate
 */
export function simulateFutureProfile(candidate, program) {
    const futureCandidate = JSON.parse(JSON.stringify(candidate)); // deep clone
    
    // 1. Add all program skills, avoiding duplicates
    const currentSkills = new Set((candidate.skills || []).map(s => s.toLowerCase()));
    const programSkillsToAdd = program.skills || [];
    
    programSkillsToAdd.forEach(skill => {
        currentSkills.add(skill.toLowerCase());
    });
    
    // Convert back to capitalized display name list
    const allSkillsSet = new Set(candidate.skills || []);
    programSkillsToAdd.forEach(skill => {
        const hasIt = (candidate.skills || []).some(cs => cs.toLowerCase() === skill.toLowerCase());
        if (!hasIt) {
            allSkillsSet.add(skill);
        }
    });
    futureCandidate.skills = Array.from(allSkillsSet);

    // 2. Add all program projects (with legitimate custom descriptions)
    const allProjects = [...(candidate.projects || [])];
    const programProjectsToAdd = program.projects || [];
    
    programProjectsToAdd.forEach(projTitle => {
        const hasProj = (candidate.projects || []).some(p => p && p.title && String(p.title).toLowerCase().includes(projTitle.toLowerCase()));
        if (!hasProj) {
            const details = (program.projectDetails && program.projectDetails[projTitle]) || PROJECT_DETAILS[projTitle] || {
                desc: `Comprehensive industry-grade project implementing key technologies as part of the Wrench Wise curriculum.`,
                tech: program.skills.slice(0, 4).join(", ")
            };
            allProjects.push({
                title: projTitle + " (Wrench Wise Capstone)",
                desc: details.desc,
                tech: details.tech
            });
        }
    });
    futureCandidate.projects = allProjects;

    // 3. Add certifications
    const allCerts = [...(candidate.certifications || [])];
    (program.certifications || []).forEach(cert => {
        if (!allCerts.includes(cert)) {
            allCerts.push(cert);
        }
    });
    futureCandidate.certifications = allCerts;

    // 4. Legitimate Career Branding & Industry Tools Improvements
    futureCandidate.github = futureCandidate.github || "github.com/upgraded-profile";
    futureCandidate.linkedin = futureCandidate.linkedin || "linkedin.com/in/upgraded-profile";

    // Inject core industry tools taught in the program to boost Industry Tools score legitimately
    const programTools = (program.essentialTools || (program.id === 'aiml' ? ['aws', 'docker', 'linux', 'git'] : ['git', 'vscode', 'aws', 'docker'])).map(t => t.toLowerCase());
    programTools.forEach(tool => {
        if (!allSkillsSet.has(tool) && !(candidate.skills || []).some(s => s.toLowerCase() === tool.toLowerCase())) {
            allSkillsSet.add(tool);
            futureCandidate.skills.push(tool);
        }
    });

    return futureCandidate;
}

/**
 * Calculates current vs projected employability score
 * @param {Object} candidate - Original candidate
 * @param {Object} program - Selected program
 * @param {Object} benchmark - Program benchmark
 * @param {Object} weights - Admin scoring weights
 */
export function getTransformationComparison(candidate, program, benchmark, weights) {
    // ATS for current (keep text-based parser value) and future (compute from profile)
    const currentAts = candidate.atsReadiness !== undefined ? candidate.atsReadiness : calculateAtsFromProfile(candidate);
    const futureProfile = simulateFutureProfile(candidate, program);

    // Calculate the legitimate ATS score delta based on actual items added
    const newSkills = Math.max(0, (futureProfile.skills || []).length - (candidate.skills || []).length);
    const newProjects = Math.max(0, (futureProfile.projects || []).length - (candidate.projects || []).length);
    const newCerts = Math.max(0, (futureProfile.certifications || []).length - (candidate.certifications || []).length);

    let atsDelta = 0;
    atsDelta += Math.min(12, newSkills * 2); // +2 per new skill (max 12)
    atsDelta += Math.min(15, newProjects * 5); // +5 per new project (max 15)
    atsDelta += Math.min(10, newCerts * 5); // +5 per new cert (max 10)
    
    // WrenchWise program guarantees ATS-compliant formatting (adds standard headers, layout, keywords)
    if (currentAts < 80) atsDelta += 8;
    else if (currentAts < 90) atsDelta += 4;
    
    // Future ATS should be original ATS plus the legitimate delta, capped at 98 to look realistic
    const futureAts = Math.min(98, currentAts + atsDelta);

    candidate.atsReadiness = currentAts;
    futureProfile.atsReadiness = futureAts;

    // Current scores
    const currentRaw = calculateComponentScores(candidate, program, benchmark);
    const currentEvaluation = evaluateEmployability(currentRaw, weights);
    
    // Future simulated profile & scores
    const futureRaw = calculateComponentScores(futureProfile, program, benchmark);
    const futureEvaluation = evaluateEmployability(futureRaw, weights);

    return {
        current: {
            profile: candidate,
            rawScores: currentRaw,
            evaluation: currentEvaluation,
            atsReadiness: currentAts
        },
        future: {
            profile: futureProfile,
            rawScores: futureRaw,
            evaluation: futureEvaluation,
            atsReadiness: futureAts
        },
        improvement: futureEvaluation.overallScore - currentEvaluation.overallScore
    };
}

/**
 * Generates Recruiter Style observations
 */
export function getRecruiterObservations(candidate, futureCandidate) {
    const concerns = [];
    const strengths = [];

    // Evaluate Concerns (Original Profile)
    if ((candidate.skills || []).length < 6) {
        concerns.push("Limited tech stack; lacks knowledge of industry-standard frameworks and developer tools.");
    }
    if ((candidate.projects || []).length < 2) {
        concerns.push("Insufficient project repository; hard to verify practical build capabilities or coding patterns.");
    }
    if (!candidate.github) {
        concerns.push("Invisible digital footprint; missing active public repositories for code verification.");
    }
    if ((candidate.experience || []).length === 0) {
        concerns.push("Lacks real-world internship or industry project exposure, signifying low onboarding readiness.");
    }
    if (concerns.length === 0) {
        concerns.push("Competent foundational elements, but profile lacks specific high-demand tech stacks and certifications.");
    }

    // Evaluate Strengths (Future Profile) - data-driven from actual improvements
    const newSkillsCount = (futureCandidate.skills || []).length - (candidate.skills || []).length;
    const newProjectsCount = (futureCandidate.projects || []).length - (candidate.projects || []).length;
    const newCertsCount = (futureCandidate.certifications || []).length - (candidate.certifications || []).length;

    if (newSkillsCount > 0) strengths.push(`Gained ${newSkillsCount} new industry-aligned technical skills through the program curriculum.`);
    if (newProjectsCount > 0) strengths.push(`Built ${newProjectsCount} additional verified projects, demonstrating practical implementation capability.`);
    if (newCertsCount > 0) strengths.push(`Earned ${newCertsCount} new verified industry certifications from Wrench Wise.`);
    if (candidate.github || futureCandidate.github) strengths.push("Active GitHub presence with code repositories for skill verification.");
    if (strengths.length === 0) strengths.push("Profile foundation established; continued skill development recommended.");

    return { concerns, strengths };
}

/**
 * Computes role compatibility percentages before and after
 * @param {Object} candidate - Original candidate
 * @param {Object} futureCandidate - Transformed candidate
 * @param {string} programId - "aiml" or "fullstack"
 */
export function calculateJobMatching(candidate, futureCandidate, programId) {
    const programs = getStorageItem('wrenchwise_programs', []);
    const program = programs.find(p => p.id === programId);
    
    const roles = (program && program.roles)
        ? program.roles.map(r => r.title)
        : (programId === "aiml" 
            ? ["AI Engineer", "Machine Learning Engineer", "Data Scientist", "AI Developer", "GenAI Engineer"]
            : ["Software Engineer", "Full Stack Developer", "Backend Developer", "Frontend Developer", "AI Application Developer"]);

    const currentSkills = (candidate.skills || []).map(s => s.toLowerCase());
    const futureSkills = (futureCandidate.skills || []).map(s => s.toLowerCase());

    const matches = roles.map(role => {
        let required = [];
        if (program && program.roles) {
            const matchedRole = program.roles.find(r => r.title === role);
            if (matchedRole) required = matchedRole.requiredSkills;
        }
        if (!required || required.length === 0) {
            required = ROLE_SKILLS[role] || [];
        }
        
        // Count matches for current
        let currentMatchCount = 0;
        required.forEach(skill => {
            if (currentSkills.some(cs => cs === skill.toLowerCase() || cs.includes(skill.toLowerCase()))) {
                currentMatchCount++;
            }
        });
        const currentPct = Math.round((currentMatchCount / required.length) * 100);

        // Count matches for future
        let futureMatchCount = 0;
        required.forEach(skill => {
            if (futureSkills.some(fs => fs === skill.toLowerCase() || fs.includes(skill.toLowerCase()))) {
                futureMatchCount++;
            }
        });
        const futurePct = Math.round((futureMatchCount / required.length) * 100);

        return {
            role,
            currentPct: Math.min(100, Math.max(10, currentPct)), // min 10% for baseline visual appearance
            futurePct: Math.min(100, Math.max(0, futurePct)),
            improvement: Math.max(0, futurePct - currentPct)
        };
    });

    return matches;
}
