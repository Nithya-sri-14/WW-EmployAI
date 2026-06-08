/* ==========================================================================
   Wrench Wise EmployAI Scoring & Explanation Engine
   ========================================================================= */

/**
 * Calculates raw component scores (0 to 100) for a candidate based on selected program benchmarks.
 * @param {Object} candidate - Parsed candidate profile
 * @param {Object} program - Selected program details
 * @param {Object} benchmark - Selected program benchmarks
 */
export function calculateComponentScores(candidate, program, benchmark) {
    // 1. Projects Component (0 - 100)
    const candProjCount = (candidate.projects || []).length;
    const targetProjCount = (benchmark && benchmark.projectsCount) || 5;
    const projectsScore = Math.min(100, Math.round((candProjCount / targetProjCount) * 100));

    // 2. Skills Component (0 - 100)
    const candSkills = (candidate.skills || []).map(s => s.trim().toLowerCase());
    const progSkills = (program && program.skills || []).map(s => s.trim().toLowerCase());
    
    let matchedSkillsCount = 0;
    const matchedSkillsList = new Set();
    
    candSkills.forEach(cSkill => {
        progSkills.forEach(pSkill => {
            const cs = cSkill;
            const ps = pSkill;
            if (cs === ps || 
                (cs.length > 2 && ps.includes(cs)) || 
                (ps.length > 2 && cs.includes(ps)) ||
                (cs === "node" && ps === "node.js") ||
                (cs === "express" && ps === "express.js") ||
                (cs === "jwt" && ps.includes("jwt")) ||
                (cs.includes("scikit") && ps.includes("scikit")) ||
                (cs.includes("tensor") && ps.includes("tensor")) ||
                (cs.includes("pytorch") && ps.includes("pytorch"))
            ) {
                matchedSkillsList.add(pSkill);
            }
        });
    });
    
    matchedSkillsCount = matchedSkillsList.size;
    const targetSkillsCount = (benchmark && benchmark.skillsCount) || 10;
    const skillsScore = Math.min(100, Math.round((matchedSkillsCount / targetSkillsCount) * 100));

    // 3. Portfolio Component (0 - 100) -> Now based just on GitHub and LinkedIn
    let portfolioScore = 0;
    if (candidate.github) portfolioScore += 50;
    if (candidate.linkedin) portfolioScore += 50;

    // 4. Experience Component (0 - 100) — now uses internship + work status
    let expScore = 0;
    if (candidate.hasInternship) expScore += 30;
    if (candidate.hasWorkExperience) expScore += 40;
    if ((candidate.experience || []).length > 1) expScore += 30;
    else if ((candidate.experience || []).length === 1) expScore += 15;
    expScore = Math.min(100, expScore);

    // 5. Certifications Component (0 - 100)
    const candCerts = candidate.certifications || [];
    const targetCertsCount = (benchmark && benchmark.certificationsCount) || 2;
    const certificationsScore = Math.min(100, Math.round((candCerts.length / targetCertsCount) * 100));

    // 6. ATS Component (0 - 100) — from resume analysis
    const atsScore = Math.min(100, Math.max(0, candidate.atsReadiness || 0));

    // 7. Industry Tools Component (0 - 100)
    const knownTools = ['git', 'github', 'docker', 'aws', 'linux', 'vscode', 'jira', 'figma', 'kubernetes', 'jenkins', 'azure'];
    const candToolsCount = (candidate.skills || []).filter(s => knownTools.includes(s.trim().toLowerCase())).length + (candidate.industryTools || []).length;
    const targetToolsCount = (benchmark && benchmark.industryToolsCount) || 5;
    const toolsScore = Math.min(100, Math.round((candToolsCount / targetToolsCount) * 100));

    // 8. Career Branding Component (0 - 100)
    // Alias to portfolio logic, as career branding evaluates digital presence
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
