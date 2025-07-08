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

chrome.action.onClicked.addListener(async (tab) => {
  console.log("LKNASLNDLASKNDLKSJDLKSDJKLSDJ");
});
