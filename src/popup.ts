import { Store } from "./lib/store.js";
import { ImageCard } from "./components/index.js";
import { ScrapedImage } from "./lib/ImageScraper.js";
import { zip, zipSync } from "fflate";
import { warn } from "console";

// const actionHeader = document.querySelector(".popup-wrapper header .actions");
// const actionButton = actionHeader.querySelector("button");
const actionButton =
  document.querySelector<HTMLButtonElement>("button#main-action");
const imagesGrid = document.querySelector("#images-grid");

function showLoading() {
  if (!imagesGrid) return;
  const loading = document.createElement("span");
  loading.innerHTML = "Loading...";
  imagesGrid.innerHTML = "";
  imagesGrid.append(loading);
}

function showImages(images: ScrapedImage[]) {
  if (!imagesGrid || !actionButton) return;
  if (images.length === 0) {
    const span = document.createElement("span");
    span.innerHTML = "No images found.";
    imagesGrid.innerHTML = "";
    imagesGrid.append(span);
  }
  imagesGrid.innerHTML = "";
  const imageCards = images.map((img) => {
    const card = new ImageCard(img);
    return card;
  });
  imageCards.forEach((card) => imagesGrid.append(card));
  actionButton.innerText = "Download all images";
}

const state = new Store<{
  status: "idle" | "loading" | "completed" | "error";
  images: ScrapedImage[];
}>({
  status: "idle",
  images: [],
});

state.subscribe((currentState: typeof state.state) => {
  const { status, images } = currentState;
  if (status === "loading") showLoading();
  if (status === "completed") showImages(images);
});

actionButton?.addEventListener("click", async () => {
  switch (state.state.status) {
    case "idle":
      state.setState({ status: "loading" });
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        tabs.forEach(async (t) => {
          if (t.id) chrome.tabs.sendMessage(t.id, { type: "GET_IMAGES" });
        });
      });
      break;
    case "loading":
      break;
    case "completed":
      const images = state.state.images;
      const paths: { [key: string]: Uint8Array } = {};
      let unknowns = 0;

      for (let i = 0; i < images.length; i++) {
        const image = new ScrapedImage(images[i]);
        const buf = await image.arrayBuffer();
        const uint = new Uint8Array(buf);
        paths[`image-${i}.${image.fileType}`] = uint;
      }

      const zipped = zipSync(paths, { level: 0 });
      chrome.downloads.download({
        url: URL.createObjectURL(
          new Blob([zipped], { type: "application/zip" }),
        ),
        filename: "images.zip",
      });

      break;
    case "error":
      break;
  }
});

chrome.runtime.onMessage.addListener(
  (message: { type: string; images: ScrapedImage[] }) => {
    if (message.type === "IMAGES") {
      const { images } = message;
      state.setState({ status: "completed", images });
    }

    return false;
  },
);
