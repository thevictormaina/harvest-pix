# HarvestPix

HarvestPix is a browser extension that allows you to easily download all the images from any open webpage.

## Features

*   **Scrape all images:** Extracts images from `<img>` tags, `<picture>` elements, inline `<svg>`s, and CSS background images.
*   **Simple interface:** A clean and straightforward popup interface to view and download the scraped images.
*   **Download individual images:** Download single images with the click of a button.
*   **Open images in new tab:** Quickly view an image in a new tab.

## How to Use

1.  Clone or download this repository.
2.  Open your browser's extension management page.
3.  Enable "Developer mode".
4.  Click "Load unpacked" and select the cloned/downloaded directory.
5.  Navigate to any webpage and click the HarvestPix extension icon.
6.  Click "Fetch all images" to see all the images on the page.
7.  Click "Download image" on any image card to save it to your computer.

## Project Structure

*   `manifest.json`: The extension's manifest file.
*   `popup.html`, `popup.css`, `popup.js`: The popup's UI and logic.
*   `background.js`: The extension's service worker.
*   `content.js`: The content script that runs on the active tab.
*   `lib/`: Contains the core logic for image scraping and state management.
    *   `imageScraper.js`: The main class for scraping images from the DOM.
    *   `store.js`: A simple state management class.
*   `components/`: Contains the web components used in the popup.
    *   `image-card/`: The image card component.
    *   `base.js`: A base class for web components.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
