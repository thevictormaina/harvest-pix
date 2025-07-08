async function scrapeImages() {
  try {
    const { ImageScraper } = await import("./imageScraper.js");
    const images = await ImageScraper.getAll();
    return images;
  } catch (error) {
    console.trace(error);
    return;
  }
}

(async function () {
  // chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  //   if (message.type === "SCRAPE_IMAGES") {
  //     scrapeImages()
  //       .then((images) => {
  //         sendResponse({ ok: true, images });
  //       })
  //       .catch((err) => {
  //         console.trace(err);
  //         sendResponse({ ok: false, message: err });
  //       });
  //   }
  //
  //   return true;
  // });

  const images = await scrapeImages();
  chrome.runtime.sendMessage(images);
})();
