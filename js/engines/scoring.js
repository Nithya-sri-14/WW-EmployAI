/* ==========================================================================
   Wrench Wise EmployAI Scoring & Explanation Engine (Matching Concepts v3.2)
   ========================================================================= */

// Canonical mappings for standard skills to normalize comparisons
export const CANONICAL_SKILL_MAP = {
    // JavaScript / Web Stack
    'js': 'javascript',
    'javascript': 'javascript',
    'es6': 'javascript',
    'ts': 'typescript',
    'typescript': 'typescript',
    'react': 'react',
    'reactjs': 'react',
    'react.js': 'react',
    'react native': 'react native',
    'reactnative': 'react native',
    'redux': 'redux',
    'node': 'node.js',
    'nodejs': 'node.js',
    'node.js': 'node.js',
    'express': 'express.js',
    'expressjs': 'express.js',
    'express.js': 'express.js',
    'angular': 'angular',
    'angularjs': 'angular',
    'vue': 'vue',
    'vuejs': 'vue',
    'vue.js': 'vue',
    'nextjs': 'next.js',
    'next.js': 'next.js',
    'svelte': 'svelte',
    'jquery': 'jquery',
    'html': 'html',
    'html5': 'html',
    'css': 'css',
    'css3': 'css',
    'scss': 'scss',
    'sass': 'scss',
    'tailwind': 'tailwind css',
    'tailwindcss': 'tailwind css',
    'bootstrap': 'bootstrap',
    
    // Programming Languages
    'python': 'python',
    'python3': 'python',
    'py': 'python',
    'java': 'java',
    'c++': 'c++',
    'cpp': 'c++',
    'c#': 'c#',
    'csharp': 'c#',
    'golang': 'go',
    'go': 'go',
    'rust': 'rust',
    'swift': 'swift',
    'kotlin': 'kotlin',
    'r': 'r',
    'ruby': 'ruby',
    'php': 'php',
    
    // Databases / Storage
    'mongodb': 'mongodb',
    'mongo': 'mongodb',
    'postgres': 'postgresql',
    'postgresql': 'postgresql',
    'mysql': 'mysql',
    'sqlite': 'sqlite',
    'oracle': 'oracle',
    'sql': 'sql',
    'nosql': 'nosql',
    'redis': 'redis',
    'firebase': 'firebase',
    'supa': 'supabase',
    'supabase': 'supabase',
    'dynamodb': 'dynamodb',
    
    // Cloud / Infrastructure / DevOps
    'aws': 'aws',
    'amazon': 'aws',
    'azure': 'azure',
    'gcp': 'gcp',
    'google cloud': 'gcp',
    'docker': 'docker',
    'kubernetes': 'kubernetes',
    'k8s': 'kubernetes',
    'jenkins': 'jenkins',
    'cicd': 'ci/cd',
    'ci/cd': 'ci/cd',
    'terraform': 'terraform',
    'git': 'git',
    'github': 'git',
    'gitlab': 'git',
    
    // AI / ML / Data Science
    'ml': 'machine learning',
    'machine learning': 'machine learning',
    'machinelearning': 'machine learning',
    'dl': 'deep learning',
    'deep learning': 'deep learning',
    'deeplearning': 'deep learning',
    'ai': 'artificial intelligence',
    'artificial intelligence': 'artificial intelligence',
    'genai': 'generative ai',
    'gen ai': 'generative ai',
    'generative ai': 'generative ai',
    'llm': 'llm',
    'llms': 'llm',
    'nlp': 'nlp',
    'cv': 'computer vision',
    'computer vision': 'computer vision',
    'opencv': 'opencv',
    'tensorflow': 'tensorflow',
    'tf': 'tensorflow',
    'pytorch': 'pytorch',
    'keras': 'keras',
    'scikit': 'scikit-learn',
    'scikit-learn': 'scikit-learn',
    'sklearn': 'scikit-learn',
    'numpy': 'numpy',
    'pandas': 'pandas',
    'matplotlib': 'matplotlib',
    'seaborn': 'seaborn',
    'langchain': 'langchain',
    'openai': 'openai',
    'prompt engineering': 'prompt engineering',
    'promptengineering': 'prompt engineering',
    'vector database': 'vector databases',
    'vector databases': 'vector databases',
    
    // Tooling & API Protocols
    'rest': 'rest api',
    'rest api': 'rest api',
    'restful': 'rest api',
    'graphql': 'graphql',
    'jwt': 'jwt',
    'oauth': 'oauth',
    'socket': 'websockets',
    'socket.io': 'websockets',
    'websocket': 'websockets',
    'websockets': 'websockets',
    'postman': 'postman',
    'jira': 'jira',
    'figma': 'figma'
};

/**
 * Normalizes a skill string to its canonical equivalent.
 */
export function normalizeSkill(skill) {
    if (!skill) return '';
    let s = String(skill).trim().toLowerCase()
        .replace(/[\.\-\s]+/g, ' ') 
        .replace(/\s+/g, '') 
        .trim();
        
    if (CANONICAL_SKILL_MAP[s]) return CANONICAL_SKILL_MAP[s];
    
    let clean = String(skill).trim().toLowerCase();
    if (CANONICAL_SKILL_MAP[clean]) return CANONICAL_SKILL_MAP[clean];
    
    return clean;
}

/**
 * Helper to compute Levenshtein distance between two strings.
 */
export function levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= a.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= b.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
            );
        }
    }
    return matrix[a.length][b.length];
}

/**
 * Performs accurate fuzzy matching using word boundary scanning and edit distance.
 */
export function isFuzzyMatch(candSkill, progSkill) {
    const normCand = normalizeSkill(candSkill);
    const normProg = normalizeSkill(progSkill);
    if (!normCand || !normProg) return false;
    
    if (normCand === normProg) return true;
    
    // Word boundary: check if one contains the other as a whole word, preventing false substring matches (e.g. 'go' in 'django')
    const escapedProg = normProg.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regexProg = new RegExp('\\b' + escapedProg + '\\b', 'i');
    if (regexProg.test(normCand)) return true;
    
    const escapedCand = normCand.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regexCand = new RegExp('\\b' + escapedCand + '\\b', 'i');
    if (regexCand.test(normProg)) return true;
    
    // Fuzzy matching for longer terms
    if (normCand.length > 4 && normProg.length > 4) {
        const distance = levenshteinDistance(normCand, normProg);
        const maxLength = Math.max(normCand.length, normProg.length);
        if (maxLength <= 7 && distance <= 1) return true;
        if (maxLength > 7 && distance <= 2) return true;
    }
    return false;
}

/**
 * Checks if a text block contains a program skill or any of its canonical aliases with proper word boundaries.
 */
export function containsSkill(text, skill) {
    if (!text || !skill) return false;
    const cleanText = String(text).toLowerCase();
    const cleanSkill = String(skill).toLowerCase();
    
    // 1. Direct match with word boundary
    const escapedSkill = cleanSkill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    let pattern = '';
    if (/^\w/.test(cleanSkill)) {
        pattern += '\\b';
    }
    pattern += escapedSkill;
    if (/\w$/.test(cleanSkill)) {
        pattern += '\\b';
    }
    
    let regex = new RegExp(pattern, 'i');
    if (regex.test(cleanText)) return true;
    
    // 2. Check canonical aliases matching the same normalized skill
    const targetCanonical = normalizeSkill(skill);
    for (const [alias, canonical] of Object.entries(CANONICAL_SKILL_MAP)) {
        if (canonical === targetCanonical) {
            const escapedAlias = alias.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            let aliasPattern = '';
            if (/^\w/.test(alias)) {
                aliasPattern += '\\b';
            }
            aliasPattern += escapedAlias;
            if (/\w$/.test(alias)) {
                aliasPattern += '\\b';
            }
            const aliasRegex = new RegExp(aliasPattern, 'i');
            if (aliasRegex.test(cleanText)) return true;
        }
    }
    
    return false;
}

/**
 * Calculates raw component scores (0 to 100) for a candidate based on selected program benchmarks.
 */
export function calculateComponentScores(candidate, program, benchmark) {
    // 1. Projects Component (0 - 100)
    const candProjCount = (candidate.projects || []).length;
    const targetProjCount = (benchmark && benchmark.projectsCount) || 5;
    const projectsScore = Math.min(100, Math.round((candProjCount / targetProjCount) * 100));

    // 2. Skills Component (0 - 100) - Normalized Fuzzy Matcher
    const candSkills = (candidate.skills || []).filter(Boolean);
    const progSkills = (program && program.skills || []).filter(Boolean);
    
    const matchedSkillsList = new Set();
    
    candSkills.forEach(cSkill => {
        progSkills.forEach(pSkill => {
            if (isFuzzyMatch(cSkill, pSkill)) {
                matchedSkillsList.add(pSkill);
            }
        });
    });
    
    const matchedSkillsCount = matchedSkillsList.size;
    const targetSkillsCount = (benchmark && benchmark.skillsCount) || 10;
    const skillsScore = Math.min(100, Math.round((matchedSkillsCount / targetSkillsCount) * 100));

    // 3. Portfolio Component (0 - 100)
    let portfolioScore = 0;
    if (candidate.github) portfolioScore += 50;
    if (candidate.linkedin) portfolioScore += 50;

    // 4. Experience Component (0 - 100) - Continuous Relevance & Duration Scoring
    const targetMonths = (benchmark && benchmark.experienceMonths) || 6;
    const experiences = candidate.experience || [];
    
    let relevantMonths = 0;
    let partiallyRelevantMonths = 0;
    let otherMonths = 0;
    
    experiences.forEach(exp => {
        let months = parseInt(exp.duration_months);
        if (isNaN(months) || months <= 0) {
            months = 0;
            if (exp.duration) {
                const dur = exp.duration.toLowerCase();
                const yearMatch = dur.match(/(\d+)\s*yr|\b(\d+)\s*year/);
                const monthMatch = dur.match(/(\d+)\s*mo|\b(\d+)\s*month/);
                if (yearMatch) months += (parseInt(yearMatch[1] || yearMatch[2]) * 12);
                if (monthMatch) months += parseInt(monthMatch[1] || monthMatch[2]);
                
                if (months === 0 && dur.includes('-')) {
                    months = 6; // default for date range
                }
            }
            if (months <= 0) months = 3; // base minimum per block
        }
        
        // Match experience content with target program skills using containsSkill (word-boundary & canonical alias checker)
        let matchWeight = 0;
        const matchedSkillsForExp = new Set();
        
        progSkills.forEach(pSkill => {
            if (containsSkill(exp.title, pSkill)) {
                matchWeight += 2.5; // High relevance weight for job title matches
                matchedSkillsForExp.add(pSkill);
            } else if (containsSkill(exp.desc, pSkill)) {
                matchWeight += 1.0; // Standard relevance weight for description matches
                matchedSkillsForExp.add(pSkill);
            }
        });

        // Compute relevance factor (0.0 to 1.0)
        const relevanceScore = Math.min(1.0, matchWeight / 4.0);
        const effectiveMonths = months * relevanceScore;

        if (relevanceScore >= 0.5) {
            relevantMonths += months; // strong match counts fully
        } else if (relevanceScore >= 0.15) {
            partiallyRelevantMonths += effectiveMonths; // partial match counts proportionally
        } else {
            otherMonths += months; // unrelated experience counts minimally
        }
    });
    
    // Scale durations to final experience component score
    const weightedMonths = (relevantMonths * 1.0) + (partiallyRelevantMonths * 0.6) + (otherMonths * 0.2);
    let expScore = Math.min(100, Math.round((weightedMonths / targetMonths) * 70));
    
    // Add status bonuses (max 30 points)
    if (candidate.hasInternship) expScore += 15;
    if (candidate.hasWorkExperience) expScore += 15;
    
    // Fallback if no experience blocks but status flags are set
    if (experiences.length === 0) {
        if (candidate.hasWorkExperience) expScore += 40;
        if (candidate.hasInternship) expScore += 30;
    }
    
    expScore = Math.min(100, Math.max(0, expScore));

    // 5. Certifications Component (0 - 100)
    const candCerts = candidate.certifications || [];
    const targetCertsCount = (benchmark && benchmark.certificationsCount) || 2;
    const certificationsScore = Math.min(100, Math.round((candCerts.length / targetCertsCount) * 100));

    // 6. ATS Component (0 - 100)
    const atsScore = Math.min(100, Math.max(0, candidate.atsReadiness || 0));

    // 7. Industry Tools Component (0 - 100)
    const knownTools = ['git', 'github', 'docker', 'aws', 'linux', 'vscode', 'jira', 'figma', 'kubernetes', 'jenkins', 'azure'];
    const candToolsCount = (candidate.skills || []).filter(s => knownTools.includes(s.trim().toLowerCase())).length;
    const targetToolsCount = (benchmark && benchmark.industryToolsCount) || 5;
    const toolsScore = Math.min(100, Math.round((candToolsCount / targetToolsCount) * 100));

    // 8. Career Branding Component (0 - 100)
    const brandingScore = portfolioScore;

    return {
        projects: projectsScore,
        skills: skillsScore,
        portfolio: portfolioScore,
        careerBranding: brandingScore,
        experience: expScore,
        certifications: certificationsScore,
        ats: atsScore,
        industryTools: toolsScore
    };
}

/**
 * Calculates the overall employability score and details the score breakdown out of configured weights.
 * @param {Object} rawScores - The component scores (0-100) computed from calculateComponentScores
 * @param {Object} weights - Scoring weights configuration (sums to 100)
 * @returns {Object} { overallScore, breakdown: { category: { score, weight, contribution } } }
 */
export function evaluateEmployability(rawScores, weights) {
    let weightedSum = 0;
    const breakdown = {};

    Object.keys(weights).forEach(key => {
        const score100 = rawScores[key] || 0;
        const weight = weights[key];
        const contribution = Math.round((score100 * weight) / 100 * 10) / 10; // 1 decimal place
        
        weightedSum += contribution;
        breakdown[key] = {
            score100: score100,
            weight: weight,
            contribution: contribution
        };
    });

    const overallScore = Math.min(100, Math.max(0, Math.round(weightedSum)));

    return {
        overallScore,
        breakdown
    };
}

/**
 * Helper to return a grade classification based on score.
 * @param {number} score 
 */
export function getScoreGrade(score) {
    if (score < 40) return { label: "Critical Gaps", class: "score-badge-poor" };
    if (score < 60) return { label: "Needs Training", class: "score-badge-fair" };
    if (score < 80) return { label: "Employable", class: "score-badge-good" };
    return { label: "Industry Ready", class: "score-badge-ready" };
}
