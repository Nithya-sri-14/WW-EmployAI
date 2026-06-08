/* ==========================================================================
   Wrench Wise EmployAI Utilities & Report Generator
   ========================================================================== */

/**
 * Gets data from localStorage with a fallback
 */
export function getStorageItem(key, defaultValue) {
    try {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : defaultValue;
    } catch (e) {
        console.error("Local storage read failed", e);
        return defaultValue;
    }
}

/**
 * Saves data to localStorage
 */
export function setStorageItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        
        // Sync with backend database if it is a wrenchwise data key
        const syncKeys = [
            'wrenchwise_programs',
            'wrenchwise_benchmarks',
            'wrenchwise_weights',
            'wrenchwise_counselors',
            'wrenchwise_leads'
        ];
        if (syncKeys.includes(key)) {
            const dbKey = key.replace('wrenchwise_', '');
            fetch('/api/db/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ key: dbKey, data: value })
            }).catch(err => console.error(`Database background sync failed for key "${dbKey}":`, err));
        }
    } catch (e) {
        console.error("Local storage write failed", e);
    }
}

/**
 * Renders a premium Toast Notification
 * @param {string} message - Text to show
 * @param {string} type - 'success', 'error', 'info'
 */
export function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'info';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'alert-triangle';

    toast.innerHTML = `
        <i data-lucide="${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Initialize icon
    if (window.lucide) {
        window.lucide.createIcons({
            attrs: { class: 'toast-icon' }
        });
    }

    setTimeout(() => {
        toast.style.animation = "fadeOut 0.3s forwards";
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
}

/**
 * Populates print-report container and triggers native print.
 * @param {Object} data - Comparison data from transformation engine
 * @param {Object} program - Selected program details
 * @param {string} leadStatus - Current lead tracking status
 */
export function generatePrintReport(data, program, leadStatus) {
    const printContainer = document.getElementById('print-report');
    if (!printContainer) return;

    const current = data.current;
    const future = data.future;
    const missing = data.gaps || { missingSkills: [], missingProjects: [] };
    const obs = data.observations || { concerns: [], strengths: [] };

    const currentAts = current.atsReadiness ?? 0;
    const futureAts = future.atsReadiness ?? 0;

    const dateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const isAiml = program.id === 'aiml';
    const roleMatches = data.jobMatches || [];

    printContainer.innerHTML = `
        <!-- PAGE 1: TITLE & SNAPSHOT -->
        <div class="print-page">
            <div class="print-header">
                <div class="print-logo-text">WRENCH WISE <span>EMPLOYAI</span></div>
                <div class="print-tagline">Transformation Report</div>
            </div>
            
            <div class="print-title" style="margin-top: 40px;">Career Assessment & Transformation Report</div>
            <div class="print-subtitle">Prepared for ${current.profile.name} • ${program.name}</div>
            
            <div class="print-section" style="margin-top: 20px;">
                <div class="print-section-title">Candidate Profile Snapshot</div>
                <div class="print-grid-2">
                    <div class="print-card">
                        <p style="margin-bottom: 8px;"><strong>Email:</strong> ${current.profile.email || 'N/A'}</p>
                        <p style="margin-bottom: 8px;"><strong>Phone:</strong> ${current.profile.phone || 'N/A'}</p>
                        <p style="margin-bottom: 8px;"><strong>LinkedIn:</strong> ${current.profile.linkedin || 'None'}</p>
                        <p><strong>GitHub:</strong> ${current.profile.github || 'None'}</p>
                    </div>
                    <div class="print-card">
                        <p style="margin-bottom: 8px;"><strong>Skills Count:</strong> ${(current.profile.skills || []).length}</p>
                        <p style="margin-bottom: 8px;"><strong>Project Count:</strong> ${(current.profile.projects || []).length}</p>
                        <p style="margin-bottom: 8px;"><strong>Certifications:</strong> ${(current.profile.certifications || []).length}</p>
                        <p style="margin-bottom: 8px;"><strong>Internship:</strong> ${current.profile.hasInternship ? 'Yes' : 'No'}</p>
                        <p><strong>Work Experience:</strong> ${current.profile.hasWorkExperience ? 'Yes' : 'No'}</p>
                    </div>
                </div>
            </div>

            <div class="print-section" style="margin-top: 40px;">
                <div class="print-section-title">Employability & ATS Growth Projection</div>
                <div style="display: flex; align-items: center; justify-content: space-around; padding: 24px; border: 2px dashed #008d9b; border-radius: 12px; background: #f8fafc; flex-wrap:wrap; gap:16px;">
                    <div style="text-align: center;">
                        <h4 style="color:#6b7280; font-size:10pt;">CURRENT PROFILE</h4>
                        <div class="print-score-pill poor" style="font-size: 24pt; padding: 8px 16px; margin-top: 8px;">${current.evaluation.overallScore} / 100</div>
                        <div style="margin-top:6px; font-size:9pt; color:#6b7280;">ATS: ${currentAts}%</div>
                    </div>
                    <div style="font-size: 32pt; color: #008d9b; font-weight: bold;">➔</div>
                    <div style="text-align: center;">
                        <h4 style="color:#6b7280; font-size:10pt;">PROJECTED POST-PROGRAM</h4>
                        <div class="print-score-pill ready" style="font-size: 24pt; padding: 8px 16px; margin-top: 8px;">${future.evaluation.overallScore} / 100</div>
                        <div style="margin-top:6px; font-size:9pt; color:#059669;">ATS: ${futureAts}%</div>
                    </div>
                    <div style="text-align: center;">
                        <h4 style="color:#6b7280; font-size:10pt;">SCORE GROWTH</h4>
                        <div style="font-size: 22pt; color: #10b981; font-weight: 800; margin-top: 8px;">+${data.improvement} Points</div>
                    </div>
                    <div style="text-align: center; border-left: 1px solid #d1d5db; padding-left: 16px;">
                        <h4 style="color:#6b7280; font-size:10pt;">ATS IMPROVEMENT</h4>
                        <div style="font-size: 18pt; color: #10b981; font-weight: 800; margin-top: 8px;">${currentAts}% ➔ ${futureAts}%</div>
                        <div style="margin-top:4px; font-size:10pt; color:#10b981;">+${futureAts - currentAts}%</div>
                    </div>
                </div>
            </div>

            <div class="print-footer">
                <span>Date generated: ${dateStr}</span>
                <span>Page 1 of 4</span>
            </div>
        </div>

        <!-- PAGE 2: GAP ANALYSIS -->
        <div class="print-page">
            <div class="print-header">
                <div class="print-logo-text">WRENCH WISE <span>EMPLOYAI</span></div>
                <div class="print-tagline">Employability Gap Analysis</div>
            </div>

            <div class="print-section">
                <div class="print-section-title">Industry Readiness Benchmarks</div>
                <table class="print-table">
                    <thead>
                        <tr>
                            <th>Performance Metric</th>
                            <th>Candidate Profile</th>
                            <th>Target Benchmark</th>
                            <th>Ready Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Relevant Skill Count</strong></td>
                            <td>${(current.profile.skills || []).length} Skills</td>
                            <td>${program.id === 'aiml' ? '10' : '11'} Skills</td>
                            <td><span class="print-score-pill poor">Gaps Identified</span></td>
                        </tr>
                        <tr>
                            <td><strong>Technical Projects</strong></td>
                            <td>${(current.profile.projects || []).length} Built</td>
                            <td>5 Projects</td>
                            <td><span class="print-score-pill poor">Deficit</span></td>
                        </tr>
                        <tr>
                            <td><strong>GitHub Presence</strong></td>
                            <td>${current.profile.github ? 'Active' : 'No'}</td>
                            <td>Required</td>
                            <td><span class="print-score-pill ${current.profile.github ? 'ready' : 'poor'}">${current.profile.github ? 'Yes' : 'No'}</span></td>
                        </tr>
                            <td><strong>LinkedIn Profile</strong></td>
                            <td>${current.profile.linkedin ? 'Active' : 'No'}</td>
                            <td>Recommended</td>
                            <td><span class="print-score-pill ${current.profile.linkedin ? 'ready' : 'poor'}">${current.profile.linkedin ? 'Yes' : 'No'}</span></td>
                        </tr>
                        <tr>
                            <td><strong>ATS Resume Score</strong></td>
                            <td>${currentAts}%</td>
                            <td>60%+</td>
                            <td><span class="print-score-pill ${currentAts >= 60 ? 'ready' : currentAts >= 40 ? 'fair' : 'poor'}">${currentAts >= 60 ? 'Optimized' : currentAts >= 40 ? 'Needs Work' : 'Poor'}</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="print-section" style="margin-top: 30px;">
                <div class="print-section-title">Program Transforming Gaps</div>
                <div class="print-grid-2">
                    <div class="print-card" style="border-left: 4px solid #ef4444;">
                        <h4 style="color:#ef4444; margin-bottom: 8px;">Key Missing Skills</h4>
                        <ul style="padding-left: 18px; line-height: 1.5; font-size: 8.5pt;">
                            ${missing.missingSkills.slice(0, 6).map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="print-card" style="border-left: 4px solid #10b981;">
                        <h4 style="color:#10b981; margin-bottom: 8px;">Wrench Wise Projects Gained</h4>
                        <ul style="padding-left: 18px; line-height: 1.5; font-size: 8.5pt;">
                            ${missing.missingProjects.slice(0, 4).map(p => `<li>${p}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>

            <div class="print-footer">
                <span>Wrench Wise EmployAI Transformation Report</span>
                <span>Page 2 of 4</span>
            </div>
        </div>

        <!-- PAGE 3: ROLE-BASED COMPATIBILITY (Selected Course Only) -->
        <div class="print-page">
            <div class="print-header">
                <div class="print-logo-text">WRENCH WISE <span>EMPLOYAI</span></div>
                <div class="print-tagline">Role-Based Career Compatibility — ${program.name}</div>
            </div>

            <div class="print-section">
                <div class="print-section-title" style="color:${isAiml ? '#008d9b' : '#00b5c5'};">${program.name} — Role Compatibility</div>
                <table class="print-table">
                    <thead>
                        <tr>
                            <th>Job Role</th>
                            <th>Current Match</th>
                            <th>After Program</th>
                            <th>Improvement</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${roleMatches.map(m => `
                            <tr>
                                <td><strong>${m.role}</strong></td>
                                <td><span class="print-score-pill poor">${m.currentPct}%</span></td>
                                <td><span class="print-score-pill ready">${m.futurePct}%</span></td>
                                <td style="color:#10b981; font-weight:800;">+${m.improvement}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="print-section" style="margin-top: 20px;">
                <div class="print-section-title">Certifications Portfolio</div>
                <div style="padding: 8px; font-size:9pt;">
                    ${(current.profile.certifications || []).length > 0
                        ? `<ul style="padding-left:18px; line-height:1.6;">${current.profile.certifications.map(c => `<li>${c}</li>`).join('')}</ul>`
                        : '<p style="color:#9ca3af;">No certifications listed</p>'
                    }
                    ${(future.profile.certifications || []).length > (current.profile.certifications || []).length
                        ? `<div style="margin-top:8px; border-top:1px dashed #10b981; padding-top:8px;">
                              <strong style="color:#10b981;">+ Program Certifications to be Earned:</strong>
                              <ul style="padding-left:18px; line-height:1.6; margin-top:4px;">
                                  ${future.profile.certifications.slice(current.profile.certifications.length).map(c => `<li><span class="print-diff-added">${c}</span></li>`).join('')}
                              </ul>
                           </div>`
                        : ''
                    }
                </div>
            </div>

            <div class="print-footer">
                <span>Wrench Wise EmployAI Transformation Report</span>
                <span>Page 3 of 4</span>
            </div>
        </div>

        <!-- PAGE 4: RECRUITER OBS & RESUME DIFF -->
        <div class="print-page">
            <div class="print-header">
                <div class="print-logo-text">WRENCH WISE <span>EMPLOYAI</span></div>
                <div class="print-tagline">Recruiter Perspective & Resume Diff</div>
            </div>

            <div class="print-section">
                <div class="print-section-title">Recruiter Observations Comparison</div>
                <div class="print-grid-2">
                    <div class="print-card" style="border-top: 3px solid #ef4444;">
                        <h4 style="color:#ef4444; margin-bottom: 12px; font-weight: bold;">Current Concerns</h4>
                        <ul style="padding-left:16px; font-size: 8.5pt; line-height: 1.5;">
                            ${obs.concerns.map(c => `<li style="margin-bottom:8px;">${c}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="print-card" style="border-top: 3px solid #10b981;">
                        <h4 style="color:#10b981; margin-bottom: 12px; font-weight: bold;">Transformed Strengths</h4>
                        <ul style="padding-left:16px; font-size: 8.5pt; line-height: 1.5;">
                            ${obs.strengths.map(s => `<li style="margin-bottom:8px;">${s}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>

            <div class="print-section" style="margin-top: 30px;">
                <div class="print-section-title">Resume Evolution Preview</div>
                <div class="print-resume-split">
                    <div class="print-resume-box">
                        <h4>Current Original Skills</h4>
                        <p style="margin-bottom: 8px;">${(current.profile.skills || []).join(', ') || 'None listed'}</p>
                        <h4>Current Projects</h4>
                        ${(current.profile.projects || []).length > 0 
                            ? current.profile.projects.map(p => `<p style="margin-bottom: 6px;"><strong>${p.title}</strong>: ${(p.desc || '').substring(0, 100)}...</p>`).join('')
                            : '<p style="color:#9ca3af;">No projects extracted</p>'}
                        <h4 style="margin-top:12px;">Certifications</h4>
                        <p>${(current.profile.certifications || []).join(', ') || 'None'}</p>
                    </div>
                    <div class="print-resume-box" style="border: 1px solid #10b981;">
                        <h4 style="color:#059669;">Transformed Resume (Enhanced)</h4>
                        <p style="margin-bottom: 8px;">
                            ${(future.profile.skills || []).join(', ') || 'None listed'}
                        </p>
                        <h4 style="color:#059669;">Projects Portfolio</h4>
                        ${(future.profile.projects || []).map(p => `<p style="margin-bottom: 4px;"><strong>${p.title}</strong></p>`).join('')}
                        <h4 style="color:#059669; margin-top:12px;">Certifications</h4>
                        <p>${(future.profile.certifications || []).join(', ') || 'None'}</p>
                    </div>
                </div>
            </div>

            <div class="print-section" style="margin-top: 30px; text-align: center; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;">
                <p style="font-size:9pt; color:#4b5563;">
                    Original ATS: ${currentAts}% ➔ Projected ATS: ${futureAts}% (+${futureAts - currentAts}%)
                </p>
                <p style="font-size:9pt; color:#4b5563; margin-top:4px;">
                    Internship: ${current.profile.hasInternship ? 'Yes' : 'No'} • Work Experience: ${current.profile.hasWorkExperience ? 'Yes' : 'No'} • Lead Status: <strong>${leadStatus}</strong>
                </p>
            </div>

            <div class="print-footer">
                <span>Counselor Demo Session • Wrench Wise Sales</span>
                <span>Page 4 of 4</span>
            </div>
        </div>
    `;

    // Wait a brief tick for render, then print
    setTimeout(() => {
        window.print();
    }, 150);
}

/**
 * Resolves the Gemini API key from the backend proxy, or localStorage.
 * @returns {Promise<string|null>} Resolves with the API Key or null
 */
export async function getGeminiApiKey() {
    // 1. Try to fetch from backend
    try {
        const res = await fetch('/api/get-gemini-key');
        if (res.ok) {
            const data = await res.json();
            if (data.key && data.key.trim() && !data.key.includes('YOUR_FALLBACK_KEY') && !data.key.includes('AIzaSy_YOUR_FALLBACK')) {
                return data.key.trim();
            }
        }
    } catch (e) {
        console.warn("Could not fetch API key from backend");
    }

    // 2. Try to get from localStorage
    const storedKey = getStorageItem('wrenchwise_gemini_api_key', null);
    if (storedKey && storedKey.trim()) {
        return storedKey.trim();
    }

    return null;
}
