import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import fs from 'fs';

dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'db.json');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));
app.use(express.json());

// API Route to securely fetch Gemini Key from environment variable
app.get('/api/get-gemini-key', (req, res) => {
    const key = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_SECRET;
    res.json({ key: key || null });
});

app.post('/api/send-email', async (req, res) => {
    try {
        const rawApiKey = process.env.BREVO_API_KEY || '';
        const rawSenderEmail = process.env.BREVO_SENDER_EMAIL || 'hello@wrench-wise.com';

        const apiKey = rawApiKey.replace(/[^a-zA-Z0-9-]/g, '');
        const senderEmail = rawSenderEmail.replace(/[^a-zA-Z0-9@._+-]/g, '');
        
        if (!apiKey) {
            return res.status(500).json({ error: "Server missing BREVO_API_KEY" });
        }
        
        const { to_email, to_name, password } = req.body || {};
        
        if (!to_email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const emailParts = to_email.split('@');
        const username = emailParts[0].replace(/[^a-zA-Z0-9._+-]/g, '');
        const recipient1 = `${username}@gmail.com`;
        const recipient2 = `${username}@wrench-wise.com`;
        
        const emailData = {
            sender: { name: "Wrench Wise EmployAI", email: senderEmail },
            to: [
                { email: recipient1, name: to_name || "Counselor" },
                { email: recipient2, name: to_name || "Counselor" }
            ],
            subject: "Wrench Wise EmployAI - Account Access Approved",
            htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #0369a1;">Account Access Approved</h2>
                    <p>Hi ${to_name || "Counselor"},</p>
                    <p>Your access to the Wrench Wise EmployAI platform has been permitted.</p>
                    <p>You can now log in using your auto-generated secure credentials:</p>
                    <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${recipient1} / ${recipient2}</p>
                        <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
                    </div>
                    <p><em>Please note: You can change your password at any time by logging in and clicking the "Change Password" button in the top navigation bar.</em></p>
                    <p>Best regards,<br>Admin Team</p>
                </div>
            `
        };

        console.log("Attempting to send email via Brevo to:", recipient1, "and", recipient2);
        console.log("Using API Key:", apiKey ? apiKey.substring(0, 15) + "..." : "undefined");
        console.log("Sender Email:", senderEmail);
        
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });
        
        const responseText = await response.text();
        console.log("Brevo API Response Status:", response.status);
        console.log("Brevo API Response Body:", responseText);
        
        if (!response.ok) {
            throw new Error(`Brevo API Error: ${response.status} - ${responseText}`);
        }
        
        return res.json({ success: true, message: "Email sent via Brevo" });
    } catch (error) {
        console.error("Failed to send email via Brevo:", error);
        return res.status(500).json({ error: error.message });
    }
});


// Database Load Endpoint
app.get('/api/db/load', (req, res) => {
    try {
        if (!fs.existsSync(DB_PATH)) {
            return res.json({
                weights: null,
                benchmarks: null,
                programs: null,
                counselors: null,
                leads: null
            });
        }
        const data = fs.readFileSync(DB_PATH, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error("Failed to load database:", error);
        res.status(500).json({ error: "Failed to load database" });
    }
});

// Database Save Endpoint
app.post('/api/db/save', (req, res) => {
    const { key, data } = req.body;
    if (!key) {
        return res.status(400).json({ error: "Missing database key" });
    }
    try {
        let db = {
            weights: null,
            benchmarks: null,
            programs: null,
            counselors: null,
            leads: null
        };
        if (fs.existsSync(DB_PATH)) {
            const currentData = fs.readFileSync(DB_PATH, 'utf8');
            db = JSON.parse(currentData);
        }
        db[key] = data;
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
        res.json({ success: true });
    } catch (error) {
        console.error("Failed to save database:", error);
        res.status(500).json({ error: "Failed to save database" });
    }
});

// For SPA routing: send all unmatched requests to index.html
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
