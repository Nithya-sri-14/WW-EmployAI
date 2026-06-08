import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    const dbPath = path.join(process.cwd(), 'db.json');
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      return res.status(200).json(JSON.parse(data));
    }
    return res.status(200).json({
      weights: null,
      benchmarks: null,
      programs: null,
      counselors: null,
      leads: null
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load database" });
  }
}
