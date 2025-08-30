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

profile_dir = "./web.instagram.com"

async def main():
    playwright, browser, context, page = await start_browser(profile_dir=profile_dir)
    await page.goto("https://www.instagram.com/")
    
    await asyncio.sleep(5)  # Wait for 5 seconds to ensure the page loads

    span = page.locator("//span[text()='Explore']")
    await span.click()
    
    await asyncio.sleep(5)  # Wait for 5 seconds to ensure the page loads
    
    # find main
    main = page.locator("main")

    # get all the divs within this xpath recursively and their innertext: 
    
    images = main.locator("xpath=.//div/div[1]/div//img")
    
    imgs_num = await images.count()
    
    print(imgs_num)
    
    # for i in range(imgs_num):
    #     img = images.nth(i)
    #     print(await img.get_attribute("alt"))

    #keep the script running
    while True:
        await asyncio.sleep(3600)  # Sleep for an hour
    # You may want to keep the browser open or close it after some time
    # await browser.close()  # Uncomment if you want to close the browser

if __name__ == "__main__":
    asyncio.run(main())




