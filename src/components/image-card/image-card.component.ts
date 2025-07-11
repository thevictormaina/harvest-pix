import { WebComponent } from "../base.js";
import { ScrapedImage } from "../../lib/ImageScraper.js";

export class ImageCard extends WebComponent {
  static registeredName = "image-card";

  constructor(opts: ScrapedImage) {
    super();
    if (!opts) return;

    const { url, description = "", fileType } = opts;
    this.url = url;
    this.description = description;
    this.type = fileType;
  }

  url: URL;
  description: string;
  type: string;

  connectedCallback() {
    super.connectedCallback();
    const actions =
      this.shadowRoot?.querySelectorAll<HTMLAnchorElement>(".actions > a.btn");
    actions?.forEach((a) => (a.href = this.url.toString()));

    const img = this.shadowRoot?.querySelector<HTMLImageElement>(
      ".image-wrapper > img",
    );

    if (!img) return;
    img.src = this.url.toString();
    img.alt = this.description;

    const description = this.shadowRoot?.querySelector("p.description");
    if (!description) return;
    description.innerHTML = `${this.type}<br>${this.description}`;
  }
}

ImageCard.initialize("components/image-card/").then(() => {
  customElements.define(ImageCard.registeredName, ImageCard);
});
