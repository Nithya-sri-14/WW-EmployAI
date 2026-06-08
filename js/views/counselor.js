/* ==========================================================================
   Wrench Wise EmployAI Counselor View
   ========================================================================== */

import { parseResumeFile } from '../engines/parser.js';
import { getTransformationComparison, getRecruiterObservations, calculateJobMatching, simulateFutureProfile } from '../engines/transformation.js';
import { analyzeGaps } from '../engines/gapAnalysis.js';
import { getScoreGrade } from '../engines/scoring.js';
import { showToast, getStorageItem, setStorageItem, generatePrintReport } from '../utils.js';

let activeCandidate = null;
let selectedProgramId = 'aiml'; // default program
let activeTab = 'scores'; // default tab on dashboard
let leadStatus = 'Interested'; // default status
let comparisonChart = null; // Chart instance for comparison graph

/**
 * Main entry to render the Counselor journey.
 * @param {HTMLElement} container - Main content area
 * @param {Object} currentUser - Authenticated counselor user
 */
export function renderCounselorView(container, currentUser) {
    activeCandidate = null;
    selectedProgramId = 'aiml';
    activeTab = 'scores';
    leadStatus = 'Interested';

    container.innerHTML = `
        <div id="counselor-full-page">
            <div id="upload-section"></div>
            <div id="edit-section" style="display:none;"></div>
            <div id="report-section" style="display:none;"></div>
        </div>
    `;

    renderUploadStep(document.getElementById('upload-section'));
}

function renderUploadStep(uploadContainer) {
    uploadContainer.innerHTML = `
        <div class="glass-card mb-24">
            <h2 class="mb-24" style="font-family: var(--font-heading); color: var(--text-main);">Candidate Assessment Center</h2>
            <p style="color: var(--text-muted); margin-bottom: 24px;">Upload a prospect's resume to parse details, identify career gaps, and simulate their professional transformation.</p>
            
            <div class="upload-grid">
                <div class="dropzone-container" id="dropzone">
                    <input type="file" id="resume-file" class="file-input-hidden" accept=".pdf,.docx,.txt,.png,.jpg,.jpeg">
                    <div class="dropzone-icon">
                        <i data-lucide="upload-cloud"></i>
                    </div>
                    <div class="dropzone-text">Drag and drop candidate resume here</div>
                    <div class="dropzone-subtext">Supports PDF, DOCX, TXT, PNG, or JPG (Max size 10MB)</div>
                    <button class="btn btn-secondary">Select File</button>
                </div>
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('resume-file');

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleUploadedFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            handleUploadedFile(fileInput.files[0]);
        }
    });
}

function handleUploadedFile(file) {
    if (file.size > 10 * 1024 * 1024) {
        showToast("File size exceeds 10MB limit.", "error");
        return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'parsing-loader-overlay';
    overlay.innerHTML = `
        <div class="loader-content">
            <div class="progress-ring-container">
                <div class="progress-spinner"></div>
                <div class="progress-text-percent" id="parse-percentage">0%</div>
            </div>
            <div class="loader-title" id="parse-loader-status">Uploading & scanning file...</div>
            <div class="loader-subtitle">EmployAI Resume Parser Engine v2.5</div>
        </div>
    `;
    document.body.appendChild(overlay);

    let progress = 0;
    const statusMessages = [
        "Reading document & extracting text...",
        "Extracting contact & profile details...",
        "Scanning skills & technologies...",
        "Identifying projects & experience...",
        "Detecting certifications...",
        "Building candidate profile..."
    ];

    const interval = setInterval(() => {
        if (progress < 85) {
            progress += 15;
            if (progress > 85) progress = 85;
            const pctEl = document.getElementById('parse-percentage');
            if (pctEl) pctEl.textContent = `${progress}%`;
            const msgIndex = Math.min(statusMessages.length - 1, Math.floor(progress / 15));
            const statusEl = document.getElementById('parse-loader-status');
            if (statusEl) statusEl.textContent = statusMessages[msgIndex];
        }
    }, 10);

    parseResumeFile(file)
        .then(candidate => {
            activeCandidate = candidate;
            clearInterval(interval);
            progress = 100;
            const pctEl = document.getElementById('parse-percentage');
            if (pctEl) pctEl.textContent = "100%";
            const statusEl = document.getElementById('parse-loader-status');
            if (statusEl) statusEl.textContent = "Parsed successfully!";
            setTimeout(() => {
                overlay.remove();
                showToast("Resume parsed successfully!", "success");
                document.getElementById('edit-section').style.display = 'block';
                renderSnapshotStep(document.getElementById('edit-section'));
                document.getElementById('edit-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);
        })
        .catch(err => {
            clearInterval(interval);
            overlay.remove();
            showToast(err.message, "error");
        });
}

/**
 * STEP 4 & 5: Candidate Snapshot & Edit Parsed Data
 */
function renderSnapshotStep(container) {
    // Calculate completeness %
    const fields = [
        activeCandidate.name,
        activeCandidate.email,
        activeCandidate.github,
        activeCandidate.linkedin,
        (activeCandidate.skills || []).length > 0,
        (activeCandidate.certifications || []).length > 0,
        activeCandidate.hasInternship,
        activeCandidate.hasWorkExperience
    ];
    const filled = fields.filter(Boolean).length;
    const completeness = activeCandidate.resume_completeness ? Math.round(activeCandidate.resume_completeness) : Math.round((filled / fields.length) * 100);

    const expMonths = (activeCandidate.experience || [])
        .filter(e => !e.is_internship)
        .reduce((sum, e) => sum + (parseInt(e.duration_months) || 0), 0);

    const internMonths = (activeCandidate.experience || [])
        .filter(e => e.is_internship)
        .reduce((sum, e) => sum + (parseInt(e.duration_months) || 0), 0);

    container.innerHTML = `
        <div style="max-width: 900px; margin: 0 auto;">
            <!-- Center Edit Form & Program Choice -->
            <div class="glass-card edit-form-panel">
                <div class="card-title-row" style="border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 24px;">
                    <h3 style="font-family: var(--font-heading); color: var(--text-main); margin-bottom: 0;">
                        <i data-lucide="edit-3" style="vertical-align:middle; margin-right:8px; color:var(--primary-light);"></i>Review & Edit Parsed Data
                    </h3>
                    <div style="font-size:0.85rem; color:var(--text-muted); font-weight:600;">Profile Completeness: <span style="color:var(--primary-light);">${completeness}%</span></div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="edit-name">Full Name</label>
                        <input type="text" id="edit-name" class="form-input" value="${activeCandidate.name || ''}" style="padding-left:16px;">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="edit-email">Email</label>
                        <input type="email" id="edit-email" class="form-input" value="${activeCandidate.email || ''}" placeholder="email@example.com" style="padding-left:16px;">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="edit-linkedin">LinkedIn URL</label>
                        <input type="text" id="edit-linkedin" class="form-input" value="${activeCandidate.linkedin || ''}" placeholder="linkedin.com/in/username" style="padding-left:16px;">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="edit-github">GitHub URL</label>
                        <input type="text" id="edit-github" class="form-input" value="${activeCandidate.github || ''}" placeholder="github.com/username" style="padding-left:16px;">
                    </div>
                </div>

                <div class="form-row" style="gap:24px; margin-bottom:16px;">
                    <div class="form-group" style="flex:1;">
                        <label class="form-label" for="edit-workstatus">Work Experience Status</label>
                        <select id="edit-workstatus" class="form-input" style="padding:8px 16px; height:40px;">
                            <option value="true" ${activeCandidate.hasWorkExperience ? 'selected' : ''}>Has Work Experience (Yes)</option>
                            <option value="false" ${!activeCandidate.hasWorkExperience ? 'selected' : ''}>No Work Experience (No)</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex:1;">
                        <label class="form-label" for="edit-experience-months">Work Experience (Months)</label>
                        <input type="number" id="edit-experience-months" class="form-input" value="${expMonths}" min="0" max="120" style="padding-left:16px; height:40px;">
                    </div>
                </div>

                <div class="form-row" style="gap:24px; margin-bottom:16px;">
                    <div class="form-group" style="flex:1;">
                        <label class="form-label" for="edit-internship">Internship Status</label>
                        <select id="edit-internship" class="form-input" style="padding:8px 16px; height:40px;">
                            <option value="true" ${activeCandidate.hasInternship ? 'selected' : ''}>Has Internship (Yes)</option>
                            <option value="false" ${!activeCandidate.hasInternship ? 'selected' : ''}>No Internship (No)</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex:1;">
                        <label class="form-label" for="edit-internship-months">Internship Duration (Months)</label>
                        <input type="number" id="edit-internship-months" class="form-input" value="${internMonths}" min="0" max="60" style="padding-left:16px; height:40px;">
                    </div>
                </div>

                <div class="form-row" style="gap:24px; margin-bottom:16px;">
                    <div class="form-group" style="flex:1;">
                        <label class="form-label" for="edit-projects-count">Projects Count</label>
                        <input type="number" id="edit-projects-count" class="form-input" value="${(activeCandidate.projects || []).length}" min="0" max="10" style="padding-left:16px; height:40px;">
                    </div>
                    <div class="form-group" style="flex:1;">
                        <label class="form-label" for="edit-ats-score">ATS Resume Score (%)</label>
                        <input type="number" id="edit-ats-score" class="form-input" value="${activeCandidate.atsReadiness ?? 40}" min="0" max="100" style="padding-left:16px; height:40px;">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Core Skills</label>
                    <div class="pill-input-row">
                        <input type="text" id="skill-add-input" class="form-input" placeholder="Add custom skill..." style="padding-left:16px; flex: 1;">
                        <button type="button" class="btn btn-secondary" id="btn-add-skill" style="padding: 10px 14px;">Add</button>
                    </div>
                    <div class="pill-container" id="skills-pill-box">
                        <!-- Skills will be rendered here -->
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Certifications</label>
                    <div class="pill-input-row">
                        <input type="text" id="cert-add-input" class="form-input" placeholder="Add certification..." style="padding-left:16px; flex: 1;">
                        <button type="button" class="btn btn-secondary" id="btn-add-cert" style="padding: 10px 14px;">Add</button>
                    </div>
                    <div class="pill-container" id="certs-pill-box">
                        <!-- Certifications will be rendered here -->
                    </div>

                <!-- Program Selection Section -->
                <div class="program-selection-container" style="border-top:1px solid var(--border-color); padding-top:24px; margin-top: 24px; width:100%;">
                    <h3 style="align-self: flex-start; margin-bottom: 16px; font-family: var(--font-heading);">Select Candidate Career Program Path</h3>
                    <div class="program-cards-grid" id="counselor-program-grid">
                        <!-- Rendered dynamically below -->
                    </div>

                    <button class="btn btn-primary w-full" id="btn-run-analysis" style="padding:14px; font-size:1rem; margin-top: 24px;">
                        <i data-lucide="zap"></i>
                        <span>Make Transformation Report</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const skillsBox = document.getElementById('skills-pill-box');
    const skillInput = document.getElementById('skill-add-input');
    const skillAddBtn = document.getElementById('btn-add-skill');
    const certsBox = document.getElementById('certs-pill-box');
    const certInput = document.getElementById('cert-add-input');
    const certAddBtn = document.getElementById('btn-add-cert');

    // Function to render skills list
    const renderSkills = () => {
        skillsBox.innerHTML = '';
        (activeCandidate.skills || []).forEach((skill, idx) => {
            const pill = document.createElement('div');
            pill.className = 'pill';
            pill.innerHTML = `
                <span>${skill}</span>
                <button type="button" data-idx="${idx}"><i data-lucide="x"></i></button>
            `;
            skillsBox.appendChild(pill);
        });
        if (window.lucide) window.lucide.createIcons();

        // Bind delete events
        skillsBox.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                activeCandidate.skills.splice(idx, 1);
                renderSkills();
            });
        });
    };

    renderSkills();

    // Render certifications
    const renderCerts = () => {
        certsBox.innerHTML = '';
        (activeCandidate.certifications || []).forEach((cert, idx) => {
            const pill = document.createElement('div');
            pill.className = 'pill';
            pill.innerHTML = `
                <span>${cert}</span>
                <button type="button" data-idx="${idx}"><i data-lucide="x"></i></button>
            `;
            certsBox.appendChild(pill);
        });
        if (window.lucide) window.lucide.createIcons();
        certsBox.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                activeCandidate.certifications.splice(idx, 1);
                renderCerts();
            });
        });
    };

    renderCerts();

    // Sync from Project Count input
    const projCountInput = document.getElementById('edit-projects-count');
    if (projCountInput) {
        projCountInput.addEventListener('change', () => {
            const count = parseInt(projCountInput.value) || 0;
            let currentProj = activeCandidate.projects || [];
            
            if (currentProj.length < count) {
                while (currentProj.length < count) {
                    currentProj.push({
                        title: 'New Portfolio Project',
                        desc: 'Designed and built a full stack application.',
                        tech: 'JavaScript, Node.js, HTML, CSS',
                        url: ''
                    });
                }
            } else if (currentProj.length > count) {
                currentProj = currentProj.slice(0, count);
            }
            activeCandidate.projects = currentProj;
        });
    }

    // Add Cert Handler
    const addCertAction = () => {
        const val = certInput.value.trim();
        if (val && !activeCandidate.certifications.includes(val)) {
            activeCandidate.certifications.push(val);
            certInput.value = '';
            renderCerts();
        }
    };
    certAddBtn.addEventListener('click', addCertAction);
    certInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCertAction();
        }
    });

    // Add Skill Handlers
    const addSkillAction = () => {
        const val = skillInput.value.trim();
        if (val && !activeCandidate.skills.includes(val)) {
            activeCandidate.skills.push(val);
            skillInput.value = '';
            renderSkills();
        }
    };
    skillAddBtn.addEventListener('click', addSkillAction);
    skillInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkillAction();
        }
    });

    // Select elements
    const workStatusSelect = document.getElementById('edit-workstatus');
    const expMonthsInput = document.getElementById('edit-experience-months');
    const internshipSelect = document.getElementById('edit-internship');
    const internMonthsInput = document.getElementById('edit-internship-months');

    // Experience Sync
    if (workStatusSelect && expMonthsInput) {
        if (workStatusSelect.value === 'false') {
            expMonthsInput.value = 0;
            expMonthsInput.disabled = true;
        }

        workStatusSelect.addEventListener('change', () => {
            if (workStatusSelect.value === 'false') {
                expMonthsInput.value = 0;
                expMonthsInput.disabled = true;
            } else {
                expMonthsInput.disabled = false;
                if (parseInt(expMonthsInput.value) <= 0) {
                    expMonthsInput.value = 6; // default fallback
                }
            }
        });

        expMonthsInput.addEventListener('input', () => {
            const val = parseInt(expMonthsInput.value) || 0;
            if (val > 0) {
                workStatusSelect.value = 'true';
            } else {
                workStatusSelect.value = 'false';
                expMonthsInput.disabled = true;
            }
        });
    }

    // Internship Sync
    if (internshipSelect && internMonthsInput) {
        if (internshipSelect.value === 'false') {
            internMonthsInput.value = 0;
            internMonthsInput.disabled = true;
        }

        internshipSelect.addEventListener('change', () => {
            if (internshipSelect.value === 'false') {
                internMonthsInput.value = 0;
                internMonthsInput.disabled = true;
            } else {
                internMonthsInput.disabled = false;
                if (parseInt(internMonthsInput.value) <= 0) {
                    internMonthsInput.value = 3; // default fallback
                }
            }
        });

        internMonthsInput.addEventListener('input', () => {
            const val = parseInt(internMonthsInput.value) || 0;
            if (val > 0) {
                internshipSelect.value = 'true';
            } else {
                internshipSelect.value = 'false';
                internMonthsInput.disabled = true;
            }
        });
    }

    // Program selection bindings
    const allPrograms = getStorageItem('wrenchwise_programs', []);
    // Hide disabled or incomplete programs (missing skills, projects, or certs) to prevent hallucinations
    const programs = allPrograms.filter(p => {
        return !p.disabled && p.name && (p.skills || []).length > 0 && (p.projects || []).length > 0 && (p.certifications || []).length > 0;
    });
    
    if (programs.length > 0 && (!selectedProgramId || !programs.some(p => p.id === selectedProgramId))) {
        selectedProgramId = programs[0].id;
    }
    
    const programGrid = document.getElementById('counselor-program-grid');
    if (programGrid && programs.length > 0) {
        programGrid.innerHTML = programs.map((p, idx) => {
            const badge = p.id === 'aiml' ? 'Advanced AI/ML' : (p.id === 'fullstack' ? 'AI-Powered Full Stack' : `${p.id.toUpperCase()} Path`);
            const desc = p.id === 'aiml' 
                ? '7 progressive phases covering 5 industry AI paths. Master deep learning, Generative AI, and Agentic Systems, complete with hands-on capstones and full MLOps pipelines.'
                : (p.id === 'fullstack'
                    ? 'A 120-day intensive program mastering the MERN Stack, modern responsive design, authentication, cloud deployment, and advanced AI application integrations.'
                    : `Upskill in ${p.name}. Features standard tools, comprehensive curriculum projects, and verified credentials.`);

            return `
                <div class="program-card ${p.id === selectedProgramId ? 'active' : ''}" data-prog="${p.id}" id="prog-card-${p.id}">
                    <span class="program-badge">${badge}</span>
                    <h4 class="program-title">${p.name.split(':')[0]}</h4>
                    <p class="program-desc">${desc}</p>
                    <div class="program-stats-row">
                        <div class="prog-stat">
                            <span class="prog-stat-label">Skills Stack</span>
                            <span class="prog-stat-value">${p.skills.length} Technologies</span>
                        </div>
                        <div class="prog-stat">
                            <span class="prog-stat-label">Projects Gained</span>
                            <span class="prog-stat-value">${p.projects.length} Repositories</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const programCards = programGrid.querySelectorAll('.program-card');
        programCards.forEach(card => {
            card.addEventListener('click', () => {
                selectedProgramId = card.getAttribute('data-prog');
                programCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });
        });
    }

    // Submit button bindings
    document.getElementById('btn-run-analysis').addEventListener('click', () => {
        // Collect edited values
        activeCandidate.name = document.getElementById('edit-name').value;
        activeCandidate.email = document.getElementById('edit-email').value;
        activeCandidate.linkedin = document.getElementById('edit-linkedin').value;
        activeCandidate.github = document.getElementById('edit-github').value;
        
        const hasWork = document.getElementById('edit-workstatus').value === 'true';
        const expMonths = parseInt(document.getElementById('edit-experience-months').value) || 0;
        const hasIntern = document.getElementById('edit-internship').value === 'true';
        const internMonths = parseInt(document.getElementById('edit-internship-months').value) || 0;
        const atsScore = parseInt(document.getElementById('edit-ats-score').value) || 0;
        const projCount = parseInt(document.getElementById('edit-projects-count').value) || 0;

        activeCandidate.hasWorkExperience = hasWork;
        activeCandidate.hasInternship = hasIntern;
        activeCandidate.atsReadiness = atsScore;

        // Reconstruct experience array
        let currentExp = activeCandidate.experience || [];
        
        if (!hasWork) {
            currentExp = currentExp.filter(e => e.is_internship);
        } else {
            const workItems = currentExp.filter(e => !e.is_internship);
            if (workItems.length === 0) {
                currentExp.push({
                    title: 'Software Engineer',
                    company: 'Technology Solutions',
                    duration: `${expMonths} Months`,
                    duration_months: expMonths,
                    desc: 'Developed features and wrote tests.',
                    is_internship: false
                });
            } else {
                workItems[0].duration_months = expMonths;
                workItems[0].duration = `${expMonths} Months`;
                for (let i = 1; i < workItems.length; i++) {
                    workItems[i].duration_months = 0;
                    workItems[i].duration = '0 Months';
                }
            }
        }

        if (!hasIntern) {
            currentExp = currentExp.filter(e => !e.is_internship);
        } else {
            const internItems = currentExp.filter(e => e.is_internship);
            if (internItems.length === 0) {
                currentExp.push({
                    title: 'Software Engineer Intern',
                    company: 'Technology Solutions',
                    duration: `${internMonths} Months`,
                    duration_months: internMonths,
                    desc: 'Collaborated on feature developments and bugs.',
                    is_internship: true
                });
            } else {
                internItems[0].duration_months = internMonths;
                internItems[0].duration = `${internMonths} Months`;
                for (let i = 1; i < internItems.length; i++) {
                    internItems[i].duration_months = 0;
                    internItems[i].duration = '0 Months';
                }
            }
        }
        activeCandidate.experience = currentExp;

        // Adjust projects array to match projCount
        let currentProj = activeCandidate.projects || [];
        if (currentProj.length < projCount) {
            while (currentProj.length < projCount) {
                currentProj.push({
                    title: 'Portfolio Project',
                    desc: 'Designed and built a full stack application.',
                    tech: 'JavaScript, Node.js, HTML, CSS',
                    url: ''
                });
            }
        } else if (currentProj.length > projCount) {
            currentProj = currentProj.slice(0, projCount);
        }
        activeCandidate.projects = currentProj;

        const reportSection = document.getElementById('report-section');
        reportSection.style.display = 'block';
        renderTransformationDashboard(document.getElementById('report-section'));
        setTimeout(() => reportSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    });
}

/**
 * STEP 7 - 15: Transformation Dashboard
 */
function renderTransformationDashboard(container) {
    try {
        // 1. Fetch current scoring config, program and benchmarks
        const programs = getStorageItem('wrenchwise_programs', null);
        const benchmarks = getStorageItem('wrenchwise_benchmarks', null);
        const weights = getStorageItem('wrenchwise_weights', null);

        if (!programs || !benchmarks || !weights) {
            throw new Error("Critical database configuration parameters could not be loaded from storage. Try logging out and signing in again.");
        }

        let program = programs.find(p => p.id === selectedProgramId);
        if (!program && programs.length > 0) {
            program = programs[0];
            selectedProgramId = program.id;
        }
        if (!program) {
            throw new Error(`Selected program path [${selectedProgramId}] could not be found in curriculum configuration.`);
        }
        const isAiml = program.id === 'aiml';
        const benchmark = benchmarks[selectedProgramId] || benchmarks['fullstack'] || { skillsCount: 10, projectsCount: 5, certificationsCount: 2, industryToolsCount: 5 };

        // 2. Run engines to get score comparison
        const comparison = getTransformationComparison(activeCandidate, program, benchmark, weights);
        const gaps = analyzeGaps(activeCandidate, program, benchmark);
        const recruiterObs = getRecruiterObservations(activeCandidate, comparison.future.profile);
        const jobMatches = calculateJobMatching(activeCandidate, comparison.future.profile, selectedProgramId);

        // Also calculate job matching for both programs (each with its own future profile) if they exist and are active
        const aimlProgram = programs.find(p => p.id === 'aiml');
        const fullstackProgram = programs.find(p => p.id === 'fullstack');
        let aimlJobMatches = [];
        let fullstackJobMatches = [];
        if (aimlProgram && !aimlProgram.disabled) {
            const aimlFuture = simulateFutureProfile(activeCandidate, aimlProgram);
            aimlJobMatches = calculateJobMatching(activeCandidate, aimlFuture, 'aiml');
        }
        if (fullstackProgram && !fullstackProgram.disabled) {
            const fullstackFuture = simulateFutureProfile(activeCandidate, fullstackProgram);
            fullstackJobMatches = calculateJobMatching(activeCandidate, fullstackFuture, 'fullstack');
        }

        // Save lead record in history (Step 17)
        saveAssessedLead(comparison);

        // Setup full detailed payload for report exports
        const reportData = {
            current: comparison.current,
            future: comparison.future,
            improvement: comparison.improvement,
            gaps: gaps,
            jobMatches: jobMatches,
            observations: recruiterObs,
            aimlJobMatches,
            fullstackJobMatches,
            atsReadiness: activeCandidate.atsReadiness || 0,
            hasInternship: activeCandidate.hasInternship,
            hasWorkExperience: activeCandidate.hasWorkExperience
        };

        container.innerHTML = `
            <!-- Dashboard Header Actions -->
            <div class="flex-between mb-24" style="flex-wrap:wrap; gap:16px;">
                <div>
                    <h2 style="font-family:var(--font-heading); color:var(--text-main);">Transformation Simulation Dashboard</h2>
                    <p style="color:var(--text-muted);">Demonstrate the post-training professional impact to ${activeCandidate.name}</p>
                </div>
                <div class="actions-row">
                    <button class="btn btn-secondary" id="btn-reupload">
                        <i data-lucide="refresh-cw"></i> Assess Another
                    </button>
                    <button class="btn btn-success" id="btn-export-pdf">
                        <i data-lucide="download"></i> Download Report PDF
                    </button>
                </div>
            </div>

            <!-- Comparison Dashboard Grid -->
            <div class="comparison-dashboard-grid">
                
                <!-- Left Column: Original Profile -->
                <div class="glass-card comparison-card">
                    <div class="card-title-row" style="border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
                        <h3 style="margin-bottom:0;"><i data-lucide="user" style="vertical-align:middle; margin-right:8px; color:var(--text-muted);"></i>Original Profile</h3>
                        <span class="role-badge" style="background:rgba(0,0,0,0.03); border-color:var(--border-color); color:var(--text-muted);">Previous Version</span>
                    </div>

                    <!-- Overall Score Progress Bar -->
                    <div class="comparison-score-header">
                        <div class="flex-between mb-8">
                            <span style="font-weight:600; color:var(--text-main);">Overall Score</span>
                            <span class="score-number" id="lbl-curr-score" style="font-size:1.8rem; line-height:1;">0</span>
                        </div>
                        <div class="progress-track-bg" style="height:10px; border-radius:5px;">
                            <div class="progress-track-fill ${getScoreGrade(comparison.current.evaluation.overallScore).class === 'score-badge-poor' ? 'danger' : 'warning'}" 
                                 id="current-score-bar" style="width: 0%;"></div>
                        </div>
                        <div style="margin-top:8px; font-size:0.8rem; font-weight:600;" class="${getScoreGrade(comparison.current.evaluation.overallScore).class}">
                            Grade: ${getScoreGrade(comparison.current.evaluation.overallScore).label}
                        </div>
                        <!-- ATS Score (Original) -->
                        <div style="margin-top:12px; padding-top:12px; border-top:1px solid var(--border-color); display:flex; align-items:center; gap:12px;">
                            <span style="font-size:0.8rem; color:var(--text-muted);">ATS Resume Score:</span>
                            <span style="font-weight:700; font-size:1rem; color:${comparison.current.atsReadiness >= 60 ? 'var(--success-light)' : comparison.current.atsReadiness >= 40 ? 'var(--warning)' : 'var(--danger)'};">${comparison.current.atsReadiness ?? 0}%</span>
                            <div class="progress-track-bg" style="flex:1; height:6px;">
                                <div class="progress-track-fill ${comparison.current.atsReadiness >= 60 ? 'success' : comparison.current.atsReadiness >= 40 ? 'warning' : 'danger'}" style="width:${comparison.current.atsReadiness || 0}%;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Dimension breakdown metrics -->
                    <div class="comparison-subcard">
                        <div class="comparison-section-title">Dimensions Breakdown</div>
                        <div class="scoring-breakdown-list">
                            ${Object.keys(weights).map(category => {
                                if (category.toLowerCase() === 'education') return '';
                                const currData = comparison.current.evaluation.breakdown[category];
                                const label = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                if (category === 'certifications') {
                                    const futData = comparison.future.evaluation.breakdown[category];
                                    return `
                                        <div class="breakdown-item">
                                            <div class="breakdown-meta">
                                                <span class="breakdown-label">Certifications</span>
                                                <span class="breakdown-value"><span>${currData.contribution}</span> → <span style="color:var(--success-light);">${futData.contribution}</span> / ${currData.weight}</span>
                                            </div>
                                            <div style="display:flex; gap:8px; align-items:center; margin-bottom:4px;">
                                                <span style="font-size:0.7rem; color:var(--text-muted); min-width:48px;">Original</span>
                                                <div class="progress-track-bg" style="flex:1; height:6px;">
                                                    <div class="progress-track-fill ${currData.score100 < 40 ? 'danger' : 'warning'}" style="width: ${currData.score100}%;"></div>
                                                </div>
                                                <span style="font-size:0.7rem; font-weight:600; color:var(--text-muted); min-width:30px; text-align:right;">${currData.score100}%</span>
                                            </div>
                                            <div style="display:flex; gap:8px; align-items:center;">
                                                <span style="font-size:0.7rem; color:var(--success-light); font-weight:600; min-width:48px;">Updated</span>
                                                <div class="progress-track-bg" style="flex:1; height:6px;">
                                                    <div class="progress-track-fill success" style="width: ${futData.score100}%;"></div>
                                                </div>
                                                <span style="font-size:0.7rem; font-weight:600; color:var(--success-light); min-width:30px; text-align:right;">${futData.score100}%</span>
                                            </div>
                                        </div>
                                    `;
                                }
                                return `
                                    <div class="breakdown-item">
                                        <div class="breakdown-meta">
                                            <span class="breakdown-label">${label}</span>
                                            <span class="breakdown-value"><span>${currData.contribution}</span> / ${currData.weight}</span>
                                        </div>
                                        <div class="progress-track-bg">
                                            <div class="progress-track-fill ${currData.score100 < 40 ? 'danger' : 'warning'}" style="width: ${currData.score100}%;"></div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- Technical Skills -->
                    <div class="comparison-subcard">
                        <div class="comparison-section-title">Core Skills Stack</div>
                        <div class="pill-container" style="background:transparent; border:none; padding:0; min-height:auto;">
                            ${comparison.current.profile.skills.length > 0 
                                ? comparison.current.profile.skills.map(s => `<span class="pill" style="background:rgba(0,0,0,0.03); border-color:var(--border-color); color:var(--text-main);">${s}</span>`).join('')
                                : '<span style="color:var(--text-muted); font-size:0.85rem;">No skills listed</span>'
                            }
                        </div>
                    </div>

                    <!-- Projects -->
                    <div class="comparison-subcard">
                        <div class="comparison-section-title">Projects Portfolio</div>
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            ${comparison.current.profile.projects.length > 0 
                                ? comparison.current.profile.projects.map(p => `
                                    <div style="border-bottom: 1px solid var(--border-color); padding-bottom:8px;">
                                        <div style="font-weight:600; font-size:0.85rem; color:var(--text-main);">${p.title}</div>
                                        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">${p.desc}</div>
                                    </div>
                                `).join('')
                                : '<span style="color:var(--text-muted); font-size:0.85rem;">No projects listed</span>'
                            }
                        </div>
                    </div>

                    <!-- Certifications (Current) -->
                    <div class="comparison-subcard">
                        <div class="comparison-section-title">Certifications</div>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            ${(comparison.current.profile.certifications || []).length > 0
                                ? comparison.current.profile.certifications.map(c => `
                                    <div style="font-size:0.8rem; padding:4px 0; border-bottom:1px solid var(--border-color);">${c}</div>
                                `).join('')
                                : '<span style="color:var(--text-muted); font-size:0.85rem;">No certifications listed</span>'
                            }
                            <div style="margin-top:6px; font-size:0.75rem; color:var(--text-muted);">
                                <strong>Count:</strong> ${(comparison.current.profile.certifications || []).length}
                            </div>
                        </div>
                    </div>

                    <!-- Job Compatibility -->
                    <div class="comparison-subcard">
                        <div class="comparison-section-title">Job Role Compatibility</div>
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            ${jobMatches.map(m => `
                                <div class="breakdown-item">
                                    <div class="breakdown-meta">
                                        <span class="breakdown-label" style="font-size:0.85rem;">${m.role}</span>
                                        <span class="breakdown-value" style="font-weight:600;">${m.currentPct}%</span>
                                    </div>
                                    <div class="progress-track-bg" style="height:6px;">
                                        <div class="progress-track-fill ${m.currentPct < 40 ? 'danger' : 'warning'}" style="width: ${m.currentPct}%;"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                </div>

                <!-- Right Column: Transformed Profile -->
                <div class="glass-card comparison-card" style="border-color: rgba(16, 185, 129, 0.25); background: linear-gradient(135deg, var(--bg-surface) 0%, rgba(16, 185, 129, 0.02) 100%);">
                    <div class="card-title-row" style="border-bottom: 1px solid rgba(16,185,129,0.15); padding-bottom: 12px;">
                        <h3 style="margin-bottom:0; color:var(--success-light);"><i data-lucide="zap" style="vertical-align:middle; margin-right:8px; color:var(--success);"></i>Transformed Profile</h3>
                        <span class="role-badge" style="background:var(--success-glow); border-color:rgba(16,185,129,0.2); color:var(--success-light);">Updated Version</span>
                    </div>

                    <!-- Overall Score Progress Bar -->
                    <div class="comparison-score-header transformed">
                        <div class="flex-between mb-8">
                            <span style="font-weight:600; color:var(--text-main);">Projected Score</span>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span class="growth-boost-badge">+${comparison.improvement} Boost</span>
                                <span class="score-number" id="lbl-future-score" style="font-size:1.8rem; line-height:1; color:var(--success-light);">0</span>
                            </div>
                        </div>
                        <div class="progress-track-bg" style="height:10px; border-radius:5px;">
                            <div class="progress-track-fill success" id="future-score-bar" style="width: 0%;"></div>
                        </div>
                        <div style="margin-top:8px; font-size:0.8rem; font-weight:600; color:var(--success-light);">
                            Grade: Industry Ready
                        </div>
                        <!-- ATS Score (Future) -->
                        <div style="margin-top:12px; padding-top:12px; border-top:1px solid rgba(16,185,129,0.15); display:flex; align-items:center; gap:12px;">
                            <span style="font-size:0.8rem; color:var(--text-muted);">ATS Resume Score:</span>
                            <span style="font-weight:700; font-size:1rem; color:${comparison.future.atsReadiness >= 60 ? 'var(--success-light)' : comparison.future.atsReadiness >= 40 ? 'var(--warning)' : 'var(--danger)'};">${comparison.future.atsReadiness ?? 0}%</span>
                            <div class="progress-track-bg" style="flex:1; height:6px;">
                                <div class="progress-track-fill success" style="width:${Math.min(100, comparison.future.atsReadiness || 0)}%;"></div>
                            </div>
                            <span style="font-size:0.7rem; color:var(--success-light); font-weight:600;">+${Math.max(0, (comparison.future.atsReadiness || 0) - (comparison.current.atsReadiness || 0))}%</span>
                        </div>
                    </div>

                    <!-- Dimension breakdown metrics -->
                    <div class="comparison-subcard transformed">
                        <div class="comparison-section-title" style="color:var(--success-light); border-bottom-color:rgba(16,185,129,0.15);">Dimensions Breakdown</div>
                        <div class="scoring-breakdown-list">
                            ${Object.keys(weights).map(category => {
                                if (category.toLowerCase() === 'education') return '';
                                const futData = comparison.future.evaluation.breakdown[category];
                                const currData = comparison.current.evaluation.breakdown[category] || { contribution: 0, score100: 0 };
                                const label = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                
                                return `
                                    <div class="breakdown-item">
                                        <div class="breakdown-meta">
                                            <span class="breakdown-label">${label}</span>
                                            <span class="breakdown-value"><span style="color:var(--text-muted);">${currData.contribution}</span> → <span style="color:var(--success-light);">${futData.contribution}</span> / ${futData.weight}</span>
                                        </div>
                                        <div style="display:flex; gap:8px; align-items:center; margin-bottom:4px;">
                                            <span style="font-size:0.7rem; color:var(--text-muted); min-width:48px;">Original</span>
                                            <div class="progress-track-bg" style="flex:1; height:6px;">
                                                <div class="progress-track-fill ${currData.score100 < 40 ? 'danger' : 'warning'}" style="width: ${currData.score100}%;"></div>
                                            </div>
                                            <span style="font-size:0.7rem; font-weight:600; color:var(--text-muted); min-width:30px; text-align:right;">${currData.score100}%</span>
                                        </div>
                                        <div style="display:flex; gap:8px; align-items:center;">
                                            <span style="font-size:0.7rem; color:var(--success-light); font-weight:600; min-width:48px;">Updated</span>
                                            <div class="progress-track-bg" style="flex:1; height:6px;">
                                                <div class="progress-track-fill success" style="width: ${futData.score100}%;"></div>
                                            </div>
                                            <span style="font-size:0.7rem; font-weight:600; color:var(--success-light); min-width:30px; text-align:right;">${futData.score100}%</span>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- Technical Skills -->
                    <div class="comparison-subcard transformed">
                        <div class="comparison-section-title" style="color:var(--success-light); border-bottom-color:rgba(16,185,129,0.15);">Skills Gained</div>
                        <div class="pill-container" style="background:transparent; border:none; padding:0; min-height:auto;">
                            ${comparison.future.profile.skills.map(s => {
                                const isNew = !comparison.current.profile.skills.includes(s);
                                return `<span class="pill ${isNew ? 'highlighted-pill' : ''}" style="${!isNew ? 'background:rgba(0,0,0,0.03); border-color:var(--border-color); color:var(--text-main);' : ''}">${s}</span>`;
                            }).join('')}
                        </div>
                    </div>

                    <!-- Projects -->
                    <div class="comparison-subcard transformed">
                        <div class="comparison-section-title" style="color:var(--success-light); border-bottom-color:rgba(16,185,129,0.15);">Projects Portfolio Gained</div>
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            ${comparison.future.profile.projects.map(p => {
                                const isNew = p.title.includes("(Wrench Wise Capstone)");
                                return `
                                    <div class="${isNew ? 'highlighted-project' : ''}" style="${!isNew ? 'border-bottom: 1px solid var(--border-color);' : ''} padding-bottom:8px;">
                                        <div style="font-weight:600; font-size:0.85rem; color:${isNew ? 'var(--success-light)' : 'var(--text-main)'};">${p.title}</div>
                                        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">${p.desc}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- Job Compatibility -->
                    <div class="comparison-subcard transformed">
                        <div class="comparison-section-title" style="color:var(--success-light); border-bottom-color:rgba(16,185,129,0.15);">Job Role Compatibility</div>
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            ${jobMatches.map(m => `
                                <div class="breakdown-item">
                                    <div class="breakdown-meta">
                                        <span class="breakdown-label" style="font-size:0.85rem;">${m.role}</span>
                                        <span class="breakdown-value" style="font-weight:600; color:var(--success-light);">${m.futurePct}% <span style="font-size:0.75rem; color:var(--success-light); font-weight:normal;">(+${m.improvement}%)</span></span>
                                    </div>
                                    <div class="progress-track-bg" style="height:6px;">
                                        <div class="progress-track-fill success" style="width: ${m.futurePct}%;"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Certifications (Future) -->
                    <div class="comparison-subcard transformed">
                        <div class="comparison-section-title" style="color:var(--success-light); border-bottom-color:rgba(16,185,129,0.15);">Certifications Gained</div>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            ${comparison.future.profile.certifications.map(c => {
                                const isNew = !comparison.current.profile.certifications.includes(c);
                                return `
                                    <div style="font-size:0.8rem; padding:4px 0; border-bottom:1px solid rgba(16,185,129,0.15); ${isNew ? 'color:var(--success-light);' : ''}">
                                        ${isNew ? '<span style="color:var(--success-light); font-weight:bold;">+ </span>' : ''}${c}
                                    </div>
                                `;
                            }).join('') || '<span style="color:var(--text-muted); font-size:0.85rem;">No certifications</span>'}
                            <div style="margin-top:6px; font-size:0.75rem; color:var(--success-light);">
                                <strong>Count:</strong> ${(comparison.current.profile.certifications || []).length} ➔ ${(comparison.future.profile.certifications || []).length}
                                ${(comparison.future.profile.certifications || []).length > (comparison.current.profile.certifications || []).length
                                    ? `<span style="color:var(--success-light);"> (+${(comparison.future.profile.certifications || []).length - (comparison.current.profile.certifications || []).length})</span>`
                                    : ''}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Dimension Growth comparison chart -->
            <div class="glass-card mb-24" style="width:100%;">
                <h3 class="mb-16" style="font-family: var(--font-heading); color: var(--text-main);">
                    <i data-lucide="trending-up" style="vertical-align:middle; margin-right:8px; color:var(--primary-light);"></i>Dimension Growth Comparison
                </h3>
                <div style="position:relative; height:320px; width:100%;">
                    <canvas id="chart-growth-comparison"></canvas>
                </div>
            </div>

            <!-- Role-Based Scoring for Chosen Course -->
            <div class="glass-card mb-24" style="width:100%;">
                <h3 class="mb-16" style="font-family: var(--font-heading); color: var(--text-main);">
                    <i data-lucide="briefcase" style="vertical-align:middle; margin-right:8px; color:var(--primary-light);"></i>Role-Based Career Compatibility — ${program.name}
                </h3>
                <div style="display:grid; grid-template-columns: 1fr; gap:24px;">
                    <div>
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            ${jobMatches.map(m => `
                                <div class="breakdown-item">
                                    <div class="breakdown-meta">
                                        <span class="breakdown-label" style="font-size:0.85rem;">${m.role}</span>
                                        <span class="breakdown-value" style="font-weight:600; color:var(--success-light);">${m.futurePct}% <span style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">(+${m.improvement}%)</span></span>
                                    </div>
                                    <div class="progress-track-bg" style="height:8px;">
                                        <div class="progress-track-fill success" style="width:${m.futurePct}%;"></div>
                                    </div>
                                    <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:var(--text-dark); margin-top:2px;">
                                        <span>Current: ${m.currentPct}%</span>
                                        <span>Target: ${m.futurePct}%</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom Generate Report Button -->
            <div class="glass-card" style="text-align:center; margin-top:24px;">
                <p style="color:var(--text-muted); margin-bottom:20px; font-size:0.9rem;">Download the full transformation report as a print-ready PDF</p>
                <button class="btn btn-success" id="btn-export-pdf-bottom" style="padding:16px 40px; font-size:1.1rem;">
                    <i data-lucide="download"></i> Generate Transformation Report
                </button>
                <p style="color:var(--text-dark); margin-top:16px; font-size:0.8rem;">Includes profile summary, gap analysis, job compatibility, and recruiter observations.</p>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();

        // Render animations & chart
        setTimeout(() => {
            const currScore = comparison.current.evaluation.overallScore;
            const futScore = comparison.future.evaluation.overallScore;

            const currBar = document.getElementById('current-score-bar');
            const futBar = document.getElementById('future-score-bar');

            if (currBar) currBar.style.width = `${currScore}%`;
            if (futBar) futBar.style.width = `${futScore}%`;

            // Count up numbers
            animateCountUp('lbl-curr-score', currScore);
            animateCountUp('lbl-future-score', futScore);

            // Grouped Bar Chart Comparison (Chart.js)
            const growthCanvas = document.getElementById('chart-growth-comparison');
            if (growthCanvas) {
                if (comparisonChart) {
                    comparisonChart.destroy();
                    comparisonChart = null;
                }

                const growthCtx = growthCanvas.getContext('2d');
                const categories = Object.keys(weights);
                const labels = categories.map(cat => cat.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));
                
                const originalScores = categories.map(cat => comparison.current.evaluation.breakdown[cat].score100);
                const projectedScores = categories.map(cat => comparison.future.evaluation.breakdown[cat].score100);

                comparisonChart = new Chart(growthCtx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Original Profile',
                                data: originalScores,
                                backgroundColor: 'rgba(100, 116, 139, 0.4)',
                                borderColor: '#64748b',
                                borderWidth: 1.5,
                                borderRadius: 6
                            },
                            {
                                label: 'Projected Transformed Profile',
                                data: projectedScores,
                                backgroundColor: 'rgba(16, 185, 129, 0.6)',
                                borderColor: '#10b981',
                                borderWidth: 1.5,
                                borderRadius: 6
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: {
                                    color: '#1e293b',
                                    boxWidth: 12
                                }
                            }
                        },
                        scales: {
                            x: {
                                grid: { color: 'rgba(0, 0, 0, 0.03)' },
                                ticks: { color: '#64748b' }
                            },
                            y: {
                                min: 0,
                                max: 100,
                                grid: { color: 'rgba(0, 0, 0, 0.03)' },
                                ticks: { 
                                    color: '#64748b',
                                    stepSize: 20
                                }
                            }
                        }
                    }
                });
            }
        }, 100);

        // Reupload button
        document.getElementById('btn-reupload').addEventListener('click', () => {
            const editSection = document.getElementById('edit-section');
            const reportSection = document.getElementById('report-section');
            if (editSection) editSection.style.display = 'none';
            if (reportSection) reportSection.style.display = 'none';
            document.getElementById('upload-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
            renderUploadStep(document.getElementById('upload-section'));
        });

        // Export PDF Report Buttons (top and bottom)
        const exportReport = () => generatePrintReport(reportData, program, leadStatus);
        document.getElementById('btn-export-pdf').addEventListener('click', exportReport);
        document.getElementById('btn-export-pdf-bottom').addEventListener('click', exportReport);
    } catch (err) {
        console.error("Transformation assessment computation failed:", err);
        showToast(err.message, "error");
        const editSection = document.getElementById('edit-section');
        if (editSection) renderSnapshotStep(editSection);
    }
}

/**
 * Saves or updates lead assessment records in localStorage (Real-time analytics sync)
 */
function saveAssessedLead(comparison, showSuccessToast = false) {
    const leads = getStorageItem('wrenchwise_leads', []);
    
    // Check if lead already exists in records
    const email = activeCandidate.email || `${activeCandidate.name.toLowerCase().replace(/\s+/g,'')}@default.com`;
    const existingIdx = leads.findIndex(l => l.email === email);

    const leadRecord = {
        id: existingIdx >= 0 ? leads[existingIdx].id : "lead_" + Date.now(),
        name: activeCandidate.name,
        email: email,
        program: selectedProgramId,
        scoreBefore: comparison.current.evaluation.overallScore,
        scoreAfter: comparison.future.evaluation.overallScore,
        status: leadStatus,
        counselorId: "sc_01", // Active Demo Counselor
        date: new Date().toISOString().split('T')[0] // today's date
    };

    if (existingIdx >= 0) {
        leads[existingIdx] = leadRecord;
    } else {
        leads.push(leadRecord);
    }

    setStorageItem('wrenchwise_leads', leads);
    if (showSuccessToast) {
        showToast(`Lead status updated to [${leadStatus}]!`, "success");
    }
}

/**
 * Animate numbers counting up
 */
function animateCountUp(elementId, targetVal) {
    const el = document.getElementById(elementId);
    if (!el) return;
    let curr = 0;
    const step = Math.ceil(targetVal / 10);
    const timer = setInterval(() => {
        curr += step;
        if (curr >= targetVal) {
            curr = targetVal;
            clearInterval(timer);
        }
        el.textContent = curr;
    }, 10);
}

/**
 * Animates timeline nodes lighting up sequentially based on simulation growth
 */
function animateTimelineNodes(curr, fut) {
    const nodes = [
        document.getElementById('node-1'),
        document.getElementById('node-2'),
        document.getElementById('node-3'),
        document.getElementById('node-4'),
        document.getElementById('node-5'),
        document.getElementById('node-6')
    ];

    nodes.forEach((node, i) => {
        if (!node) return;
        node.className = "timeline-node"; // reset
        
        setTimeout(() => {
            if (i === 0) {
                node.className = "timeline-node active";
            } else if (i === 5) {
                node.className = "timeline-node complete";
            } else {
                node.className = "timeline-node complete";
            }
        }, i * 50); // 50ms sequential stagger
    });
}
