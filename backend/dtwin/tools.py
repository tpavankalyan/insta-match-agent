import os

def save_instagram_info(username: str) -> str:
    """
    Saves dummy instagram information for a given user.
    """
    if not os.path.exists(username):
        os.makedirs(username)
    with open(os.path.join(username, "info.txt"), "w") as f:
        f.write(f"Dummy info for {username}")
    return f"Saved dummy info for {username}"
