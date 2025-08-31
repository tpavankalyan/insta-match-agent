import os
import shutil
import json

def create_agent(user_folder, persona_prompt_path):
    agent_name = os.path.basename(user_folder)
    agent_dir = f"/Users/tpavankalyan/Documents/Cline/insta-match-agent/agents/{agent_name}"

    if not os.path.exists(agent_dir):
        os.makedirs(agent_dir)

        with open(persona_prompt_path, 'r') as f:
            instruction = f.read()

        # Use json.dumps to safely escape the instruction string
        escaped_instruction = json.dumps(instruction)

        agent_py_content = f"""from google.adk.agents import LlmAgent

root_agent = LlmAgent(
    name="{agent_name}",
    model="gemini-1.5-pro",
    instruction={escaped_instruction},
)
"""

        init_py_content = "from .agent import root_agent"

        with open(os.path.join(agent_dir, "agent.py"), "w") as f:
            f.write(agent_py_content)

        with open(os.path.join(agent_dir, "__init__.py"), "w") as f:
            f.write(init_py_content)

def main():
    usr_data_dir = "/Users/tpavankalyan/Documents/Cline/insta-match-agent/backend/usr_data"
    for user_folder in os.listdir(usr_data_dir):
        user_folder_path = os.path.join(usr_data_dir, user_folder)
        if os.path.isdir(user_folder_path):
            persona_prompt_path = os.path.join(user_folder_path, "persona_prompt.txt")
            if os.path.exists(persona_prompt_path):
                create_agent(user_folder_path, persona_prompt_path)

if __name__ == "__main__":
    main()
