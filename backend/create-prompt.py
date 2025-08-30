import os
import base64
import sys
from openai import AzureOpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Instantiate the AzureOpenAI client
client = AzureOpenAI(
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2023-05-15") # Default to a common version
)
azure_deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")

def encode_image_to_base64(image_path):
    """Encodes an image file to a base64 string."""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def create_persona_prompt(user_id):
    """
    Gathers all text and image data from the user's directory,
    sends it to an AI model, and saves the generated persona.
    """
    user_data_dir = f"/Users/tpavankalyan/Documents/Cline/insta-match-agent/backend/usr_data/{user_id}"
    if not os.path.isdir(user_data_dir):
        print(f"Error: Directory '{user_data_dir}' not found.")
        return

    # Consolidate all textual data
    full_text_content = ""
    for filename in sorted(os.listdir(user_data_dir)):
        if filename.endswith(".txt"):
            file_path = os.path.join(user_data_dir, filename)
            with open(file_path, "r", encoding="utf-8") as f:
                full_text_content += f.read() + "\n\n"

    # Prepare image data
    image_messages = []
    for filename in sorted(os.listdir(user_data_dir)):
        if filename.lower().endswith((".jpg", ".jpeg", ".png")):
            image_path = os.path.join(user_data_dir, filename)
            base64_image = encode_image_to_base64(image_path)
            image_messages.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{base64_image}"
                }
            })

    # Create the prompt for the AI model
    prompt_text = (
        "Based on the following collection of Instagram posts, comments, interests, "
        "and a self-description from the user, please create a detailed persona. "
        "This persona should be a system prompt that an LLM can use to act and respond "
        "as this user. Please put the prompt inside these tags: <sys-prompt> </sys-prompt>\n\n"
        "The persona should capture:\n"
        "- Personality traits (e.g., humorous, adventurous, introverted)\n"
        "- Communication style and tone (e.g., formal, casual, uses slang, emojis)\n"
        "- Core interests and hobbies (e.g., travel, technology, fashion, memes)\n"
        "- Values and opinions that are evident from the posts.\n\n"
        "Also, please generate the following user metadata as a JSON object and place it inside "
        "<user-meta-data> </user-meta-data> tags:\n"
        "{\n"
        "  name: <name>,\n"
        "  age: <age>,\n"
        "  image: <emoji>,\n"
        "  interests: <interests>,\n"
        "  bio: <bio>,\n"
        "}\n\n"
        "Here is all the textual data:\n"
        f"{full_text_content}"
    )

    messages = [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": prompt_text},
                *image_messages
            ]
        }
    ]

    print("Sending data to the AI model to generate the persona...")

    try:
        # Use the modern client to create the chat completion
        response = client.chat.completions.create(
            model=azure_deployment,
            messages=messages,
            max_tokens=1500,
        )

        response_content = response.choices[0].message.content
        
        # Extract persona
        persona = response_content.split("<sys-prompt>")[1].split("</sys-prompt>")[0].strip()
        
        # Extract user metadata
        user_meta_data = response_content.split("<user-meta-data>")[1].split("</user-meta-data>")[0].strip()

        # Save the generated persona to a file
        output_path_persona = os.path.join(user_data_dir, "persona_prompt.txt")
        with open(output_path_persona, "w", encoding="utf-8") as f:
            f.write(persona)
        
        # Save the user metadata to a file
        output_path_metadata = os.path.join(user_data_dir, "user_meta_data.json")
        with open(output_path_metadata, "w", encoding="utf-8") as f:
            f.write(user_meta_data)

        print(f"Successfully generated and saved the persona to '{output_path_persona}'.")
        print(f"Successfully generated and saved the user metadata to '{output_path_metadata}'.")
        print("\n--- Generated Persona ---")
        print(persona)
        print("\n--- Generated User Metadata ---")
        print(user_meta_data)

    except Exception as e:
        print(f"An error occurred while communicating with the Azure OpenAI API: {e}")
        print("Please ensure your Azure endpoint, API key, and deployment name are correct.")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        user_id = sys.argv[1]
        create_persona_prompt(user_id)
    else:
        print("Usage: python create-prompt.py <user_id>")
