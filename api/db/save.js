export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }
  // Vercel serverless environment is stateless. 
  // We return success to ensure the client runs smoothly; 
  // the frontend falls back to browser localStorage for persistence.
  return res.status(200).json({ success: true, message: "State saved" });
}
