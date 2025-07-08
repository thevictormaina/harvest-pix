import { Store } from "./lib/store.js";
import "./components/index.js";
import { ImageCard } from "./components/index.js";

/**
 * @typedef {Object} ScrapedImage
 * @property {string} url
 * @property {string|null} description
 * @property {number|null} naturalWidth
 * @property {number|null} naturalHeight
 */

const imagesGrid = document.querySelector("#images-grid");

function showLoading() {
  const loading = document.createElement("span");
  loading.innerHTML = "Loading...";
  imagesGrid.innerHTML = "";
  imagesGrid.append(loading);
}

/** @param {ScrapedImage[]} images */
function showImages(images) {
  if (images.length === 0) {
    const span = document.createElement("span");
    span.innerHTML = "No images found.";
    imagesGrid.innerHTML = "";
    imagesGrid.append(span);
  }

  imagesGrid.innerHTML = "";
  const imageCards = images.map((img) => new ImageCard(img));
  imageCards.forEach((img) => imagesGrid.append(img));

  /** @type {HTMLButtonElement} */
  const downloadButton = document.querySelector(
    ".popup-wrapper header .actions button",
  );

  downloadButton.innerText = "Download all images";

  /** @type {HTMLInputElement} */
  // const selectAll = document.querySelector(
  //   ".popup-wrapper header .actions input",
  // );
  // selectAll.removeAttribute("disabled");
}

const state = new Store({
  /** @type {"pending" | "loading" | "completed" | "error"} */
  status: "pending",
  /** @type {ScrapedImage[]} */
  images: [],
});

state.subscribe(
  /** @param {typeof state.state} state */
  (state) => {
    const { status, images } = state;
    if (status === "loading") showLoading();
    if (status === "completed") showImages(images);
  },
);

const actionHeader = document.querySelector(".popup-wrapper .actions");
const actionButton = actionHeader.querySelector("button");

actionButton.addEventListener("click", () => {
  if (state.state.status === "pending") {
    state.setState({ status: "loading" });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      tabs.forEach((t) =>
        chrome.tabs.sendMessage(t.id, { type: "GET_IMAGES" }),
      );
    });
  } else return;
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "IMAGES") {
    /** @type {{ images: ScrapedImage[] }} */
    const { images } = message;
    state.setState({ status: "completed", images });
  }
});
