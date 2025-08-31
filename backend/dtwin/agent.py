from google.adk.agents import LlmAgent
from .tools import save_instagram_info

root_agent = LlmAgent(
    name="digital_twin_agent",
    model="gemini-2.0-flash",
    instruction="You are a digital twin information collector agent. Ask minimal questions to the user as we already have the instagram data.",
    # tools=[save_instagram_info],
)
