/* ==========================================================================
   Wrench Wise EmployAI Skill Gap Analysis Engine
   ========================================================================== */

/**
 * Compares candidate's profile against program requirements to compute specific gaps.
 * @param {Object} candidate - Parsed candidate profile
 * @param {Object} program - Program metadata (curriculum, skills, projects)
 * @param {Object} benchmark - Industrial benchmarks
 * @returns {Object} Gaps object containing lists of missing items
 */
export function analyzeGaps(candidate, program, benchmark) {
    const candSkills = (candidate.skills || []).map(s => String(s).toLowerCase());
    const progSkills = (program && program.skills) || [];
    
    // 1. Missing Skills
    const missingSkills = progSkills.filter(skill => {
        return !candSkills.some(cs => cs === skill.toLowerCase() || cs.includes(skill.toLowerCase()));
    });

    // 2. Missing Projects
    const candProjects = (candidate.projects || []).map(p => p && p.title ? String(p.title).toLowerCase() : "");
    const progProjects = (program && program.projects) || [];
    
    const missingProjects = progProjects.filter(proj => {
        return !candProjects.some(cp => cp.includes(proj.toLowerCase()) || proj.toLowerCase().includes(cp));
    });

    // 3. Missing Certifications
    const candCerts = (candidate.certifications || []).map(c => String(c).toLowerCase());
    const progCerts = (program && program.certifications) || [];
    
    const missingCertifications = progCerts.filter(cert => {
        return !candCerts.some(cc => cc.includes(cert.toLowerCase()) || cert.toLowerCase().includes(cc));
    });

    // 4. Missing Portfolio Assets
    const missingPortfolioAssets = [];
    if (benchmark && benchmark.portfolioRequired && !candidate.portfolio) {
        missingPortfolioAssets.push("Personal Portfolio Website");
    }
    if (benchmark && benchmark.githubRequired && !candidate.github) {
        missingPortfolioAssets.push("GitHub Profile Portfolio");
    }

    // 5. Missing Industry Tools
    const toolsToCheck = (program && program.essentialTools) || ["Git", "GitHub"];
    const missingTools = toolsToCheck.filter(tool => {
        return !candSkills.some(cs => cs.includes(tool.toLowerCase()));
    });

    return {
        missingSkills,
        missingProjects,
        missingCertifications,
        missingPortfolioAssets,
        missingTools
    };
}
