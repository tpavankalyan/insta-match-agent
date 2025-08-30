import asyncio
import json
import os
import signal
import datetime
import requests
import argparse
from pathlib import Path
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont
import io
import time
import sys

# Redirect print to stderr
def eprint(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)

async def start_browser(headless=False, profile_dir=None):
    playwright = await async_playwright().start()
    browser_args = ["--start-maximized"]
    if profile_dir:
        profile_dir_path = Path(profile_dir)
        profile_dir_path.mkdir(parents=True, exist_ok=True)
        context = await playwright.chromium.launch_persistent_context(
            user_data_dir=str(profile_dir_path),
            headless=headless,
            args=browser_args,
        )
        browser = None
    else:
        browser = await playwright.chromium.launch(headless=headless, args=browser_args)
        context = await browser.new_context()
    page = await context.new_page()
    return playwright, browser, context, page

async def main(username, password, user_id):
    out_folder_name = f"{user_id}"
    output_path = f"/Users/tpavankalyan/Documents/Cline/insta-match-agent/backend/usr_data/{out_folder_name}"
    profile_path = f"/Users/tpavankalyan/Documents/Cline/insta-match-agent/backend/profiles/{out_folder_name}"
    # download the main image with alt text
    
    profile_dir = f"{profile_path}/web.instagram.com"

    playwright, browser, context, page = await start_browser(profile_dir=profile_dir)
    await page.goto("https://www.instagram.com/")

    await asyncio.sleep(5)

    #find all input fields
    input_fields = await page.query_selector_all("input")
    for field in input_fields:
        eprint(await field.get_attribute("name"))
        
    # fill "8688927125" in input field username
    if len(input_fields) < 2:
        eprint("already logged in")
    else:
        username_field = input_fields[0]
        await username_field.fill(username)

        # fill "pavanPRITHVI@1" in input field password
        password_field = input_fields[1]
        await password_field.fill(password)

        #click on button with type "submit"
        submit_button = await page.query_selector("button[type='submit']")
        await submit_button.click()
        await asyncio.sleep(5)  # Wait for 5 seconds to ensure the page loads

    span = page.locator("//span[text()='Profile']")
    await span.click()
    
    await asyncio.sleep(5)  # Wait for 5 seconds to ensure the page loads
    
    # If "Cancel" appears between <button> then click on it
    cancel_button = page.locator("//button[text()='Cancel']")
    if await cancel_button.count() > 0:
        await cancel_button.click()
        
    await asyncio.sleep(5)  # Wait for 5 seconds to ensure the page loads

    main_elem = page.locator("main")
    images = main_elem.locator("xpath=.//div/div/div[2]//img")

    count = await images.count()

    os.makedirs(output_path, exist_ok=True)    
    for i in range(count):
        img = images.nth(i)
        src = await img.get_attribute("src")
        alt = (await img.get_attribute("alt")) or f"image_{i}"  # fallback name if no alt
        
        if alt == "Change profile photo":
            continue
        else:
            await img.click()

        if src:
            try:
                # download all images in a post
                image_in_post = 1
                
                while True:
                    try:
                        # Download image
                        all_available_images = page.locator("xpath=.//article/div/div[1]//img[@crossorigin='anonymous']")
                        # if image_in_post == 1:
                        #     src = await all_available_images.nth(0).get_attribute("src")
                        # elif image_in_post > 1:
                        #     src = await all_available_images.nth(1).get_attribute("src")
                        src = await all_available_images.nth(image_in_post-1).get_attribute("src")

                        response = requests.get(src, stream=True, timeout=10)
                        if response.status_code == 200:
                            # sanitize filename
                            filename = f"{output_path}/{i}_{image_in_post}.jpg"
                            with open(filename, "wb") as f:
                                for chunk in response.iter_content(1024):
                                    f.write(chunk)
                            print(f"Saved: {filename}")
                        else:
                            eprint(f"Failed to download {src}")
                        
                        try:
                            next_btn = await page.wait_for_selector('button[aria-label="Next"]', timeout=3000)
                            await next_btn.click()
                            image_in_post += 1
                        except Exception:
                            eprint("Next button not found")
                            break
                    except Exception as e:
                        eprint(f"Error downloading image in post: {e}")
                        break
                
                # get all comments
                filename = f"{output_path}/{i}.txt"
                comments = await page.query_selector_all('div[role="presentation"]')
                comments_dump = ""
                for comment in comments:
                    comments_dump += await comment.inner_text()
                with open(filename, "wb") as f:
                    f.write(comments_dump.encode())

                # click the cross button
                try:
                    close_btn = await page.wait_for_selector('svg[aria-label="Close"]', timeout=3000)
                    await close_btn.click()
                except Exception:
                    eprint("Close button not found")

            except Exception as e:
                eprint(f"Error downloading {src}: {e}")
                
    await asyncio.sleep(5)  # Wait for 5 seconds to ensure the page loads

    span = page.locator("//span[text()='Explore']")
    await span.click()
    
    await asyncio.sleep(5)  # Wait for 5 seconds to ensure the page loads
    
    # find main
    main = page.locator("main")

    # get all the divs within this xpath recursively and their innertext: 
    
    images = main.locator("xpath=.//div/div[1]/div//img")
    
    imgs_num = await images.count()
    
    eprint(imgs_num)
    
    for i in range(imgs_num):
        img = images.nth(i)
        #save the src and alt to the output_folder_name folder
        src = await img.get_attribute("src")
        alt = await img.get_attribute("alt")
        with open(f"{output_path}/{i}_interests.txt", "w") as f:
            f.write(f"src: {src}\n")
            f.write(f"alt: {alt}\n")


    # keep the script running
    # while True:
    #     await asyncio.sleep(3600)  # Sleep for an hour
    # You may want to keep the browser open or close it after some time
    # await browser.close()  # Uncomment if you want to close the browser

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Instagram data scraper.")
    parser.add_argument("--username", type=str, required=True, help="Instagram username.")
    parser.add_argument("--password", type=str, required=True, help="Instagram password.")
    parser.add_argument("--user_id", type=str, required=True, help="User ID for folder name.")
    args = parser.parse_args()
    try:
        asyncio.run(main(args.username, args.password, args.user_id))
        print(json.dumps({"success": True}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
