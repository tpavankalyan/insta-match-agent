// pages/api/run-python-script.js (Pages Router)
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, session_id } = req.body;
    const { stdout } = await execAsync(`/Users/tpavankalyan/Documents/Cline/insta-match-agent/backend/.venv/bin/python /Users/tpavankalyan/Documents/Cline/insta-match-agent/backend/instagram_tool.py`);
    res.json({ message: stdout.trim(), success: true });
  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
}