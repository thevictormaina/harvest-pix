import { WebComponent } from "../base.js";

export class ImageCard extends WebComponent {
  static registeredName = "image-card";

  /** @param {import("../../script.js").ScrapedImage} opts */
  constructor(opts) {
    super();
    if (!opts) return;

    const { url = "", description = "", type = "" } = opts;
    this.url = url;
    this.description = description;
    this.type = type;
  }

  url = "";
  description = "";
  type = "";

  connectedCallback() {
    super.connectedCallback();
    /** @type {HTMLAnchorElement} */
    const openNewTabBtn = this.shadowRoot.querySelector(".actions > a.btn");
    openNewTabBtn.href = this.url;

    /** @type {HTMLImageElement} */
    const img = this.shadowRoot.querySelector(".image-wrapper > img");
    img.src = this.url;
    img.alt = this.description;

    const description = this.shadowRoot.querySelector("p.description");
    description.innerHTML = `${this.type}<br>${this.description}`;

    const downlaodButton = this.shadowRoot.querySelector(".actions button");
    downlaodButton.addEventListener("click", async () => {
      try {
        const downloadId = await chrome.downloads.download({
          url: this.url,
          saveAs: true,
        });
        console.log(downloadId);
        if (!downloadId) throw Error("Something went wrong.");
      } catch (err) {
        console.trace(err);
      }
    });
  }
}

await ImageCard.initialize("components/image-card/");
customElements.define(ImageCard.registeredName, ImageCard);
