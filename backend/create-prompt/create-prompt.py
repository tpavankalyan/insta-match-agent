# server.py
import os
import base64
import json
from openai import AzureOpenAI
from dotenv import load_dotenv
from fastapi import FastAPI
import subprocess
from glob import glob

app = FastAPI()

@app.get("/generate-persona")
def generate_persona(user_id: str):
    try:
        script_path = "/Users/tpavankalyan/Documents/Cline/insta-match-agent/backend/create-prompt.py"
        python_executable = "/Users/tpavankalyan/Documents/Cline/insta-match-agent/backend/.venv/bin/python"
        
        result = subprocess.run(
            [python_executable, script_path, user_id],
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            return {"error": result.stderr}
        return {"output": result.stdout}
    except Exception as e:
        return {"error": str(e)}

@app.get("/get-current-user-meta-data")
def get_current_user_meta_data(user_id: str):
    user_data_dir = f"/Users/tpavankalyan/Documents/Cline/insta-match-agent/backend/usr_data/{user_id}"
    meta_data_path = os.path.join(user_data_dir, "user_meta_data.json")
    if not os.path.isfile(meta_data_path):
        return {"error": f"Metadata file not found for user ID: {user_id}"}
    
    with open(meta_data_path, "r", encoding="utf-8") as f:
        res = json.loads(f.read())
        res["id"] = user_id
        return {"user_meta_data": res}

@app.get("/get-potential-matches")
def get_potential_matches(user_id: str):
    user_data_dirs = glob(f"/Users/tpavankalyan/Documents/Cline/insta-match-agent/backend/usr_data/*/user_meta_data.json")
    user_data_dirs = [i for i in user_data_dirs if user_id not in i]
    if not user_data_dirs:
        return {"error": f"No potential matches found for user ID: {user_id}"}
    potential_matches = []
    for matches_path in user_data_dirs:
        with open(matches_path, "r", encoding="utf-8") as f:
            res = json.loads(f.read())
            res["id"] = matches_path.split("/")[-2]
            potential_matches.append(res)
    return {"potential_matches": potential_matches}