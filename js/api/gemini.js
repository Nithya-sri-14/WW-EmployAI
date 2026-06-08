export async function extractProfileWithGemini(filePayload, apiKey) {
    if (!apiKey) {
        throw new Error("Gemini API Key is not configured in your Vercel/Render project settings.");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;

    const promptExtraction = `You are an enterprise-grade AI Resume Parsing Engine.

Mission: Extract the candidate's profile into the highly structured JSON schema provided.

Rules:
1. Document Intelligence: Read the attached document deeply.
2. Identity: Extract Name, Email, Phone, Location, LinkedIn, GitHub, Portfolio.
- EMAIL RULE: Extract the email address cleanly. Absolutely remove any trailing words, symbols, or labels (such as 'LinkedIn', 'GitHub', 'Phone', etc.) that might be adjacent to it in the text. For example, 'suganya3ramu@gmail.comLinkedIn' must be parsed simply as 'suganya3ramu@gmail.com'.
- LINKEDIN RULE: Must be a valid linkedin.com URL (e.g. https://linkedin.com/in/username). Do not extract search queries or random text. Clean it up to be a direct URL.
- GITHUB RULE: Must be a valid github.com URL (e.g. https://github.com/username). Do not extract random text. Clean it up to be a direct URL.
- PORTFOLIO RULE: Extract a personal portfolio website or blog if present. Do not map GitHub or LinkedIn here.
CRITICAL NAME RULES FOR candidate_name:
- STEP 1: Search ONLY within the top section, header, first 20 lines, or area near contact info. Ignore the rest of the resume for the name.
- STEP 2: ELIMINATE INVALID CANDIDATES. NEVER return numbers, emails, URLs, file names, resume titles, job titles, skills, company names, educations, certifications, technologies, addresses, social handles, or symbols (@/\\_#%$|:;=). Reject ALL CAPS skill titles (e.g. DATA SCIENCE, SOFTWARE ENGINEER, JAVA DEVELOPER).
- STEP 3: VALIDATE NAME. A valid person name usually appears alone, contains 2-5 words, is primarily alphabetic, and may contain initials/hyphens/apostrophes/middle names.
- STEP 4: SCORING. Highest priority: Large header text, near phone/email, before work experience/skills. Lower priority: References, signatures, footers. You MUST do everything computationally possible to find the true candidate name. Never return null unless the document contains absolutely no names.
3. Education Intelligence: Extract Degree, Specialization, complete Institution Name, Graduation Year, CGPA/Percentage. Do not truncate names.
4. Experience & Internships: Deeply analyze the experience section.
- You MUST flag 'is_internship' as true if the title, company, or description contains the terms 'Intern', 'Internship', 'Trainee', 'Industrial Training', 'Apprentice', or 'Co-op'.
- DURATION CALCULATION RULE: Calculate 'duration_months' as the total months of that experience block. 
  * CRITICAL REFERENCE DATE: The current date is June 2026. Use this to resolve end dates like 'Present' or 'Current' (e.g. 'Jan 2025 - Present' = 17 months, 'June 2024 - Present' = 24 months).
  * For other ranges, compute mathematically (e.g. 'July 2023 - April 2024' = 10 months, '2022 - 2023' = 12 months, '2021 - 2024' = 36 months).
  * If only years are given without months, assume 12 months per year of difference.
  * Store this calculated integer in 'duration_months'.
- Populate both the 'experience' array (with 'is_internship' flag and 'duration_months') and the 'internships' string array.
5. Projects: Identify Title, Description, Tech Stack, URLs. 
6. Certifications: Detect Provider, Title, and Date.
- CRITICAL CERTIFICATION RULE: Only extract real, verified professional certifications, credentials, courses, or licenses (e.g. AWS Certified Solutions Architect, Coursera Python Course, NPTEL, Microsoft Azure, etc.).
- DO NOT extract declarations, footer lines, resume headers, signatures, reference notices, or heading texts (e.g. 'DECLARATION', 'SOLUTIONS', 'Reference', 'Project details', etc.). If the document does not mention any certifications, return an empty array.
7. Skills Ontology: Standardize and categorize all programming languages, frameworks, DBs, Cloud, DevOps, AI/ML skills into an array.
8. Confidence: For every field extracted, calculate a confidence score (0-100) based on how clearly it was stated in the resume. Store these in the confidence_scores object.
9. Completeness: Calculate a resume_completeness percentage (0-100) based on how many core fields (identity, education, experience, skills) were successfully extracted.
10. Do NOT hallucinate. Use null for missing data.`;

    const promptVerification = `You are an AI Verification Agent for Resume Parsing.

I will provide the raw resume document and a previously extracted JSON payload.
Your mission is to perform a Second Verification Pass.

Tasks:
1. Validate every single extracted field against the raw document.
2. Remove ANY hallucinations or fabricated data.
3. CRITICAL EMAIL CLEANING: Ensure the email address does not have trailing concatenated text like 'LinkedIn' or 'GitHub'. Clean it to end in a valid TLD (like .com, .in, .org).
4. CRITICAL IDENTITY CHECK: Verify that candidate_name is a real human name. It MUST NOT contain numbers, technical terms, skills, languages, job titles, verbs, or file extensions. It must strictly be the resume owner's personal name found near the contact info. If the name is blank, you MUST aggressively scan the document to find the candidate's real name.
5. Check experience duration_months calculations. Recalculate if they are mathematically wrong (assuming today is June 2026).
6. Check project counts and certification counts. Ensure that certifications contain ONLY valid, verified professional credentials, licenses, or courses. Remove any false positives like "DECLARATION", "SOLUTIONS", signature blocks, headings, or references.
7. Correct wrong mappings (e.g. if an experience was mapped as a project).
8. Ensure the structure perfectly matches the strict JSON schema.
9. Re-calculate confidence scores based on your verification.
10. Add any warnings to the warnings array if data looks suspicious or unclear.
11. Return the finalized JSON.`;

    // Define the massive 15-layer JSON Schema
    const responseSchema = {
        type: "OBJECT",
        properties: {
            candidate_name: { type: "STRING", nullable: true },
            email: { type: "STRING", nullable: true },
            phone: { type: "STRING", nullable: true },
            location: { type: "STRING", nullable: true },
            linkedin: { type: "STRING", nullable: true },
            github: { type: "STRING", nullable: true },
            portfolio: { type: "STRING", nullable: true },
            education: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        degree: { type: "STRING", nullable: true },
                        specialization: { type: "STRING", nullable: true },
                        institution: { type: "STRING", nullable: true },
                        graduation_year: { type: "STRING", nullable: true },
                        score: { type: "STRING", nullable: true }
                    }
                }
            },
            experience: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        title: { type: "STRING", nullable: true },
                        company: { type: "STRING", nullable: true },
                        duration: { type: "STRING", nullable: true },
                        duration_months: { type: "NUMBER", nullable: true },
                        desc: { type: "STRING", nullable: true },
                        is_internship: { type: "BOOLEAN", nullable: true }
                    }
                }
            },
            projects: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        title: { type: "STRING", nullable: true },
                        desc: { type: "STRING", nullable: true },
                        tech: { type: "STRING", nullable: true },
                        url: { type: "STRING", nullable: true }
                    }
                }
            },
            certifications: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        title: { type: "STRING", nullable: true },
                        provider: { type: "STRING", nullable: true },
                        date: { type: "STRING", nullable: true }
                    }
                }
            },
            skills: {
                type: "ARRAY",
                items: { type: "STRING" }
            },
            internships: {
                type: "ARRAY",
                items: { type: "STRING" }
            },
            currently_working: { type: "BOOLEAN" },
            resume_completeness: { type: "NUMBER" },
            confidence_scores: {
                type: "OBJECT",
                properties: {
                    identity: { type: "NUMBER" },
                    education: { type: "NUMBER" },
                    experience: { type: "NUMBER" },
                    projects: { type: "NUMBER" },
                    skills: { type: "NUMBER" },
                    overall: { type: "NUMBER" }
                }
            },
            warnings: {
                type: "ARRAY",
                items: { type: "STRING" }
            }
        }
    };

    // Construct the input parts dynamically based on multi-modal or text
    let documentPart = {};
    if (filePayload.type === 'text') {
        documentPart = { text: filePayload.data };
    } else {
        documentPart = {
            inlineData: {
                mimeType: filePayload.mimeType,
                data: filePayload.data
            }
        };
    }

    const parts = [documentPart];
    if (filePayload.extractedText) {
        parts.push({ text: `Here is the OCR/raw text extracted from the document to help you copy details (like names, emails, URLs) exactly:\n${filePayload.extractedText}` });
    }
    parts.push({ text: promptExtraction });

    const extractionPayload = {
        contents: [
            {
                role: "user",
                parts: parts
            }
        ],
        generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
    };

    try {
        // PASS 1: Extraction
        console.log("Gemini Pass 1: Extracting Profile...");
        const response1 = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(extractionPayload)
        });

        if (!response1.ok) {
            const errData = await response1.json().catch(() => ({}));
            throw new Error(`Pass 1 Error: ${response1.status} - ${errData?.error?.message}`);
        }

        const data1 = await response1.json();
        const extractedJSONString = data1.candidates[0].content.parts[0].text;
        
        // PASS 2: Verification
        console.log("Gemini Pass 2: Verifying Profile against Document...");
        const verificationParts = [documentPart];
        if (filePayload.extractedText) {
            verificationParts.push({ text: `Here is the OCR/raw text extracted from the document:\n${filePayload.extractedText}` });
        }
        verificationParts.push({ text: promptVerification });
        verificationParts.push({ text: `Here is the extracted JSON from Pass 1 to verify:\n${extractedJSONString}` });

        const verificationPayload = {
            contents: [
                {
                    role: "user",
                    parts: verificationParts
                }
            ],
            generationConfig: {
                temperature: 0,
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        };

        const response2 = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(verificationPayload)
        });

        if (!response2.ok) {
            const errData = await response2.json().catch(() => ({}));
            throw new Error(`Pass 2 Error: ${response2.status} - ${errData?.error?.message}`);
        }

        const data2 = await response2.json();
        const verifiedJSONString = data2.candidates[0].content.parts[0].text;

        try {
            const finalResult = JSON.parse(verifiedJSONString);
            return finalResult;
        } catch (e) {
            console.error("Failed to parse verified JSON:", verifiedJSONString);
            return null;
        }

    } catch (error) {
        console.error("Error calling Gemini Two-Pass API:", error);
        throw error;
    }
}

export async function extractProgramFromBrochure(filePayload, apiKey) {
    if (!apiKey) {
        throw new Error("Gemini API Key is not configured in your Vercel/Render project settings.");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;

    const promptExtraction = `You are an expert AI Education Curriculum & Syllabus Extraction Engine.

Mission: Extract the course syllabus / brochure into the highly structured JSON schema provided.

Rules:
1. Identify Course Name: Search for the title of the course, curriculum, program, or certification track.
2. Skills Taxonomy: Extract the list of core technical skills, programming languages, libraries, frameworks, tools, or methodologies taught in the syllabus. Make sure to standardize skill names (e.g. ReactJS -> React, NextJS -> Next.js, Node -> Node.js, Python, Docker). Limit to 10-15 core skills.
3. Curriculum Projects: Extract the hands-on projects, capstones, real-world scenarios, or case studies mentioned in the syllabus. Generate 3-7 core project titles.
4. Project Details: For each dynamic project title extracted, generate an authentic, industry-standard description (desc) detailing what was built, and specify the exact technologies/skills (tech) used in that project as taught in this curriculum. Keep the description professional and concrete.
5. Certifications: Detect or generate 2-3 professional credentials, badges, or certificates gained upon completing this program.
6. Learning Outcomes: Formulate 3-4 professional learning outcomes demonstrating what the graduate will be able to do.
7. Essential Tools: Extract a list of 4-6 essential software packages, cloud environments, version control tools, or testing frameworks used in the course (e.g. Git, GitHub, Docker, AWS, Postman, Linux).
8. Target Job Roles: Map this curriculum to 3-5 typical industrial job roles (e.g. DevOps Engineer, Security Analyst, Frontend Developer) that a graduate of this program would qualify for. For each role, list the core required skills taught in this curriculum.

Do NOT hallucinate. Return only valid information from the brochure.`;

    const responseSchema = {
        type: "OBJECT",
        properties: {
            name: { type: "STRING" },
            skills: {
                type: "ARRAY",
                items: { type: "STRING" }
            },
            projects: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        title: { type: "STRING" },
                        desc: { type: "STRING" },
                        tech: { type: "STRING" }
                    },
                    required: ["title", "desc", "tech"]
                }
            },
            certifications: {
                type: "ARRAY",
                items: { type: "STRING" }
            },
            learningOutcomes: {
                type: "ARRAY",
                items: { type: "STRING" }
            },
            essentialTools: {
                type: "ARRAY",
                items: { type: "STRING" }
            },
            roles: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        title: { type: "STRING" },
                        requiredSkills: {
                            type: "ARRAY",
                            items: { type: "STRING" }
                        }
                    },
                    required: ["title", "requiredSkills"]
                }
            }
        },
        required: ["name", "skills", "projects", "certifications", "learningOutcomes", "essentialTools", "roles"]
    };

    let documentPart = {};
    if (filePayload.type === 'text') {
        documentPart = { text: filePayload.data };
    } else {
        documentPart = {
            inlineData: {
                mimeType: filePayload.mimeType,
                data: filePayload.data
            }
        };
    }

    const payload = {
        contents: [
            {
                role: "user",
                parts: [
                    documentPart,
                    { text: promptExtraction }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
    };

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(`Brochure Extraction Error: ${response.status} - ${errData?.error?.message}`);
        }

        const data = await response.json();
        const jsonText = data.candidates[0].content.parts[0].text;
        
        let parsed = null;
        try {
            parsed = JSON.parse(jsonText);
        } catch (parseError) {
            console.error("Failed to parse raw brochure JSON:", jsonText);
            // Fallback attempt to strip markdown code blocks
            const jsonRegex = /```json\s*([\s\S]*?)\s*```/i;
            const match = jsonText.match(jsonRegex);
            if (match && match[1]) {
                parsed = JSON.parse(match[1].trim());
            } else {
                throw parseError;
            }
        }

        // Restructure the projects from array of objects to projects array and projectDetails map
        const projectsList = [];
        const projectDetailsDict = {};
        
        if (parsed && Array.isArray(parsed.projects)) {
            parsed.projects.forEach(p => {
                if (p && p.title) {
                    projectsList.push(p.title);
                    projectDetailsDict[p.title] = {
                        desc: p.desc || "",
                        tech: p.tech || ""
                    };
                }
            });
        }
        
        parsed.projects = projectsList;
        parsed.projectDetails = projectDetailsDict;
        return parsed;

    } catch (error) {
        console.error("Error extracting program from brochure:", error);
        throw error;
    }
}
