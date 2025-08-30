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

profile_dir = "/Users/tpavankalyan/Documents/Cline/insta-match-agent/backend/profiles/dtwin_user_1756589706966_pfo1hdw/web.instagram.com"

async def main():
    playwright, browser, context, page = await start_browser(profile_dir=profile_dir)
    await page.goto("https://www.instagram.com/")
    
    await asyncio.sleep(5)  # Wait for 5 seconds to ensure the page loads

    span = page.locator("//span[text()='Profile']")
    await span.click()
    
    await asyncio.sleep(5)  # Wait for 5 seconds to ensure the page loads
    
    # If "Cancel" appears between <button> then click on it
    cancel_button = page.locator("//button[text()='Cancel']")
    if await cancel_button.count() > 0:
        await cancel_button.click()

    main_elem = page.locator("main")
    images = main_elem.locator("xpath=.//div/div/div[2]//img")

    count = await images.count()

    out_folder_name = "downloaded_images_automated"

    # download the main image with alt text
    os.makedirs(out_folder_name, exist_ok=True)

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
                            filename = f"{out_folder_name}/{i}_{image_in_post}.jpg"
                            with open(filename, "wb") as f:
                                for chunk in response.iter_content(1024):
                                    f.write(chunk)
                            print(f"Saved: {filename}")
                        else:
                            print(f"Failed to download {src}")
                        
                        try:
                            next_btn = await page.wait_for_selector('button[aria-label="Next"]', timeout=3000)
                            await next_btn.click()
                            image_in_post += 1
                        except Exception:
                            print("Next button not found")
                            break
                    except Exception as e:
                        print(f"Error downloading image in post: {e}")
                        break
                
                # get all comments
                filename = f"{out_folder_name}/{i}.txt"
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
                    print("Close button not found")

            except Exception as e:
                print(f"Error downloading {src}: {e}")

    # keep the script running
    while True:
        await asyncio.sleep(3600)  # Sleep for an hour
    # You may want to keep the browser open or close it after some time
    # await browser.close()  # Uncomment if you want to close the browser

if __name__ == "__main__":
    asyncio.run(main())




