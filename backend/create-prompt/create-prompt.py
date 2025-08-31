# server.py
import os
import base64
import json
from openai import AzureOpenAI
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
import subprocess
from glob import glob
import os

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

@app.post("/create-and-launch-agents")
async def create_and_launch_agents():
    try:
        # Get the absolute path of the project's root directory
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

        # Step 1: Create the agents by running the script
        create_agents_script_path = "/Users/tpavankalyan/Documents/Cline/insta-match-agent/backend/create_agents.py"
        python_executable = "/Users/tpavankalyan/Documents/Cline/insta-match-agent/backend/.venv/bin/python"

        result = subprocess.run(
            [python_executable, create_agents_script_path],
            capture_output=True,
            text=True,
            check=True
        )
        
        # Step 2: Launch the agents using 'adk web'
        agents_dir = "/Users/tpavankalyan/Documents/Cline/insta-match-agent/agents"
        adk_executable = "/Users/tpavankalyan/Documents/Cline/insta-match-agent/agents/.venv/bin/adk"

        # Ensure the directory exists
        if not os.path.isdir(agents_dir):
            raise HTTPException(status_code=500, detail="Agents directory not found.")

        # The command to run
        command = [adk_executable, "web", "--port", "8009"]
        
        # Run the command in the specified directory
        process = subprocess.Popen(
            command,
            cwd=agents_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        # For now, we'll just confirm it started. In a real-world scenario,
        # you might want to manage this process more carefully.
        return {"message": "Agents created and launch process started successfully.", "details": result.stdout}

    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Failed to create agents: {e.stderr}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
