/* ==========================================================================
   Wrench Wise EmployAI Analytics Dashboard View
   ========================================================================== */

import { getStorageItem } from '../utils.js';

let chartInstances = []; // reference to destroy old charts on re-render

/**
 * Renders the Analytics Dashboard.
 * @param {HTMLElement} container - Main content area
 */
export function renderAnalyticsView(container) {
    // 1. Fetch leads and counselors from localStorage
    const leads = getStorageItem('wrenchwise_leads', []);
    const counselors = getStorageItem('wrenchwise_counselors', []);
    const programs = getStorageItem('wrenchwise_programs', []);

    // 2. Perform Calculations
    const totalLeads = leads.length;
    const enrolledLeads = leads.filter(l => l.status === 'Enrolled').length;
    const conversionRate = totalLeads > 0 ? ((enrolledLeads / totalLeads) * 100).toFixed(1) : 0;
    
    // Average score growth
    let totalBefore = 0;
    let totalAfter = 0;
    leads.forEach(l => {
        totalBefore += l.scoreBefore;
        totalAfter += l.scoreAfter;
    });
    const avgGrowth = totalLeads > 0 ? Math.round((totalAfter - totalBefore) / totalLeads) : 0;

    // Program splits
    const aimlLeads = leads.filter(l => l.program === 'aiml');
    const fsLeads = leads.filter(l => l.program === 'fullstack');

    const aimlAssessments = aimlLeads.length;
    const fsAssessments = fsLeads.length;

    const aimlEnrollments = aimlLeads.filter(l => l.status === 'Enrolled').length;
    const fsEnrollments = fsLeads.filter(l => l.status === 'Enrolled').length;

    const aimlConvRate = aimlAssessments > 0 ? ((aimlEnrollments / aimlAssessments) * 100).toFixed(1) : 0;
    const fsConvRate = fsAssessments > 0 ? ((fsEnrollments / fsAssessments) * 100).toFixed(1) : 0;

    // Counselor performance aggregator
    const counselorStats = counselors.map(sc => {
        const scLeads = leads.filter(l => l.counselorId === sc.id || l.counselorId === 'sc_01' && sc.id === 'sc_01'); // link mock seeds
        const scEnrolls = scLeads.filter(l => l.status === 'Enrolled').length;
        const rate = scLeads.length > 0 ? ((scEnrolls / scLeads.length) * 100).toFixed(1) : 0;
        
        return {
            name: sc.name,
            assessments: scLeads.length,
            enrollments: scEnrolls,
            conversionPct: rate
        };
    }).sort((a,b) => b.enrollments - a.enrollments); // Sort by enrollments descending

    // 3. Render HTML Scaffolding
    container.innerHTML = `
        <!-- Dashboard Metrics Cards (Step 19) -->
        <div class="analytics-metrics-grid">
            <div class="metric-stat-card">
                <div class="metric-icon-box blue">
                    <i data-lucide="file-text"></i>
                </div>
                <div class="metric-data">
                    <span class="metric-value">${totalLeads}</span>
                    <span class="metric-label">Resumes Assessed</span>
                </div>
            </div>

            <div class="metric-stat-card">
                <div class="metric-icon-box green">
                    <i data-lucide="user-plus"></i>
                </div>
                <div class="metric-data">
                    <span class="metric-value">${enrolledLeads}</span>
                    <span class="metric-label">Enrolled Students</span>
                </div>
            </div>

            <div class="metric-stat-card">
                <div class="metric-icon-box purple">
                    <i data-lucide="percent"></i>
                </div>
                <div class="metric-data">
                    <span class="metric-value">${conversionRate}%</span>
                    <span class="metric-label">Demo Conversion Rate</span>
                </div>
            </div>

            <div class="metric-stat-card">
                <div class="metric-icon-box amber">
                    <i data-lucide="trending-up"></i>
                </div>
                <div class="metric-data">
                    <span class="metric-value">+${avgGrowth} pts</span>
                    <span class="metric-label">Average Score Growth</span>
                </div>
            </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-grid mb-24">
            <!-- Lead Funnel Chart -->
            <div class="glass-card chart-card">
                <h4 class="mb-16" style="color:var(--text-main); font-family:var(--font-heading);">Assessment Lead Funnel</h4>
                <div style="position:relative; height:240px; width:100%;">
                    <canvas id="chart-lead-funnel"></canvas>
                </div>
            </div>
            
            <!-- Program Split Chart -->
            <div class="glass-card chart-card">
                <h4 class="mb-16" style="color:var(--text-main); font-family:var(--font-heading);">Program Enrollments</h4>
                <div style="position:relative; height:240px; width:100%;">
                    <canvas id="chart-program-split"></canvas>
                </div>
            </div>
        </div>

        <div class="charts-grid">
            <!-- Counselor Leaderboard -->
            <div class="glass-card chart-card" style="grid-column: span 2;">
                <div class="flex-between mb-16">
                    <h4 style="color:var(--text-main); font-family:var(--font-heading);">Counselor Performance Rankings</h4>
                    <span style="font-size:0.75rem; color:var(--text-muted);">Updated in real-time</span>
                </div>
                
                <table class="config-table">
                    <thead>
                        <tr>
                            <th>Counselor Name</th>
                            <th>Assessments Conducted</th>
                            <th>Enrollments Generated</th>
                            <th>Conversion Efficiency</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${counselorStats.map(sc => `
                            <tr>
                                <td style="color:var(--text-main); font-weight:600;">${sc.name}</td>
                                <td>${sc.assessments} Leads</td>
                                <td style="color:var(--success-light); font-weight:700;">${sc.enrollments} Closed</td>
                                <td>
                                    <div style="display:flex; align-items:center; gap:8px;">
                                        <span style="font-weight:600; width:45px;">${sc.conversionPct}%</span>
                                        <div class="progress-track-bg" style="width:120px; height:6px;">
                                            <div class="progress-track-fill success" style="width:${sc.conversionPct}%;"></div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // 4. Render Charts using Chart.js CDNs
    // Destroy previous charts to prevent memory leaks or overlaps on tab re-entry
    chartInstances.forEach(instance => instance.destroy());
    chartInstances = [];

    renderFunnelChart(leads);
    renderProgramSplitChart(aimlAssessments, fsAssessments);
}

/**
 * Chart 1: Funnel Chart showing Leads Status distribution
 */
function renderFunnelChart(leads) {
    const canvas = document.getElementById('chart-lead-funnel');
    if (!canvas) return;

    const statuses = ["Needs Follow-Up", "Interested", "Highly Interested", "Enrolled"];
    const statusCounts = statuses.map(status => {
        return leads.filter(l => l.status === status).length;
    });

    const ctx = canvas.getContext('2d');
    const newChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: statuses,
            datasets: [{
                label: 'Lead Stages Count',
                data: statusCounts,
                backgroundColor: [
                    'rgba(217, 119, 6, 0.45)',   // Amber
                    'rgba(0, 168, 150, 0.45)',   // Turquoise Green
                    'rgba(0, 180, 216, 0.45)',   // Turquoise Blue
                    'rgba(16, 185, 129, 0.45)'   // Emerald Green
                ],
                borderColor: [
                    '#d97706', '#00a896', '#00b4d8', '#10b981'
                ],
                borderWidth: 1.5,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: { color: '#64748b' }
                },
                y: {
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: { 
                        color: '#64748b',
                        stepSize: 1
                    }
                }
            }
        }
    });

    chartInstances.push(newChart);
}

/**
 * Chart 2: Program Enrollment Doughnut
 */
function renderProgramSplitChart(aimlCount, fsCount) {
    const canvas = document.getElementById('chart-program-split');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const newChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['AI/ML Engineering', 'Full Stack with AI'],
            datasets: [{
                data: [aimlCount, fsCount],
                backgroundColor: [
                    'rgba(0, 168, 150, 0.6)',
                    'rgba(0, 180, 216, 0.6)'
                ],
                borderColor: [
                    '#00a896', '#00b4d8'
                ],
                borderWidth: 1.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#1e293b', boxWidth: 12 }
                }
            }
        }
    });

    chartInstances.push(newChart);
}
