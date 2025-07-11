// import { ImageScraper } from "./lib/ImageScraper.js";

chrome.runtime.onMessage.addListener((message: { type: string }) => {
  if (message.type === "GET_IMAGES") {
    import("./lib/ImageScraper").then(({ ImageScraper }) => {
      ImageScraper.scrapeAllImages().then((images) => {
        chrome.runtime.sendMessage({ type: "IMAGES", images });
      });
    });
  }
  return false;
});
