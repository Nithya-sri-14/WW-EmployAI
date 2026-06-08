export default async function handler(req, res) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: "Method not allowed" });
        }

        // Retrieve and sanitize environment variables aggressively
        const rawApiKey = process.env.BREVO_API_KEY || '';
        const rawSenderEmail = process.env.BREVO_SENDER_EMAIL || 'hello@wrench-wise.com';

        // Strip any non-ASCII characters, spaces, newlines, or control chars
        const apiKey = rawApiKey.replace(/[^a-zA-Z0-9-]/g, '');
        const senderEmail = rawSenderEmail.replace(/[^a-zA-Z0-9@._+-]/g, '');
        
        if (!apiKey) {
            return res.status(500).json({ error: "Server missing BREVO_API_KEY" });
        }
        
        let body = req.body;
        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch (e) {
                return res.status(400).json({ error: "Invalid JSON body" });
            }
        }
        
        if (!body) {
            return res.status(400).json({ error: "Missing request body" });
        }
        
        const { to_email, to_name, password } = body;
        
        if (!to_email || !password) {
            return res.status(400).json({ error: "Missing required fields (to_email, password)" });
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
        
        if (!response.ok) {
            throw new Error(`Brevo API Error: ${response.status} - ${responseText}`);
        }
        
        return res.status(200).json({ success: true, message: "Email sent via Brevo" });
    } catch (error) {
        console.error("Failed to send email via Brevo:", error);
        return res.status(500).json({ error: error.message });
    }
}
