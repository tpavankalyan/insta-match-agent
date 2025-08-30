# server.py
import os
import base64
import json
from openai import AzureOpenAI
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import subprocess

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/instagram")
def generate_persona(username: str, password: str, user_id: str):
    try:
        script_path = "/Users/tpavankalyan/Documents/Cline/insta-match-agent/backend/instagram_tool.py"
        python_executable = "/Users/tpavankalyan/Documents/Cline/insta-match-agent/backend/.venv/bin/python"
        
        result = subprocess.run(
            [python_executable, script_path, "--username", username, "--password", password, "--user_id", user_id],
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            return {"error": result.stderr}
        
        try:
            # Try to parse the last line of stdout as JSON
            output = json.loads(result.stdout.strip().splitlines()[-1])
            return output
        except (json.JSONDecodeError, IndexError):
            # Fallback if JSON parsing fails
            return {"error": "Failed to parse script output", "details": result.stdout}
            
    except Exception as e:
        return {"error": str(e)}
