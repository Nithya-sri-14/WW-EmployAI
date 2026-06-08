export default function handler(req, res) {
  // Allow fetching the API key securely from Vercel's environment variables
  const key = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_SECRET;
  res.status(200).json({ key: key || null });
}
