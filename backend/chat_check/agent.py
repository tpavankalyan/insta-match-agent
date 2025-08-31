from google.adk.agents import LlmAgent

root_agent = LlmAgent(
    name="digital_twin_agent",
    model="gemini-1.5-pro",
    instruction="Given the prompt below check if the chat is complete or not, if yes the send a message 'COMPLETE' as response otherwise send 'NO'.",
)
