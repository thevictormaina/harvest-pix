chrome.runtime.onMessage.addListener(async (message, sender, sendMessage) => {
  if (message.type === "GET_IMAGES") {
    const { ImageScraper } = await import("./lib/imageScraper.js");
    const images = await ImageScraper.getAll();

    // await new Promise((res, _) => {
    //   setTimeout(() => res(), 2000);
    // });

    chrome.runtime.sendMessage({ type: "IMAGES", images });
    console.log(`Sent ${images.length} image(s)!`);
  }
});
