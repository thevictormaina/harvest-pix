import { WebComponent } from "../base.js";

export class ImageCard extends WebComponent {
  static registeredName = "image-card";

  /** @param {import("../../script.js").ScrapedImage} opts */
  constructor(opts) {
    super();
    if (!opts) return;

    const { url = "", description = "" } = opts;
    this.url = url;
    this.description = description;
  }

  url = "";
  description = "";

  connectedCallback() {
    super.connectedCallback();
    /** @type {HTMLImageElement} */
    const img = this.shadowRoot.querySelector(".image-wrapper > img");
    /** @type {HTMLAnchorElement} */
    const openNewTab = this.shadowRoot.querySelector(".actions > a.btn");
    openNewTab.href = this.url;
    img.src = this.url;
    img.alt = this.description;
  }
}

await ImageCard.initialize("components/image-card/");
customElements.define(ImageCard.registeredName, ImageCard);
