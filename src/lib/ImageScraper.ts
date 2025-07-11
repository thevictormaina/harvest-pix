/**
 * Useful methods for scraping different kinds of images from the DOM.
 */
export class ImageScraper {
  static async scrapeAllImages(parent: Element | Document = document) {
    //prettier-ignore
    const scrapedImages = (await Promise.all(
        this.getImageElements(parent)
			  .map((img) => this.scrapeFromImageElement(img))
      )).filter((i) => i !== null);

    //prettier-ignore
    const scrapedBackgroundImages = (await Promise.all(
        this.getBackgroundImageElements(parent)
			  .map(({ sourceNode, image }) => this.scrapeFromImageElement(image, sourceNode))
      )).filter((i) => i !== null);

    const scrapedSVGs = [...parent.querySelectorAll("svg")].map((svg) =>
      this.scrapeFromSVGElement(svg),
    );

    return [...scrapedImages, ...scrapedBackgroundImages, ...scrapedSVGs];
  }

  /**
   * Scrape all image tags from parent. Looks for `Image` and `Picture` elements.
   */
  static getImageElements(parent: Element | Document = document) {
    const selector = "img[src], picture img[src]";
    const elements = parent.querySelectorAll<HTMLImageElement>(selector);
    return [...elements];
  }

  /**
   * Scrape all elements in parent with background images.
   */
  static getBackgroundImageElements(parent: Element | Document = document) {
    parent = parent ?? document;
    const elements = [...parent.querySelectorAll("*")];

    let backgroundImageMatchesMap = new Map<
      string,
      { sourceNode: Element; url: URL }
    >();

    for (const el of elements) {
      const bg = getComputedStyle(el).backgroundImage;
      const matches = [...bg.matchAll(/url\(["']?(.*?)["']?\)/g)];
      matches.forEach((m) => {
        const url = m[1];
        backgroundImageMatchesMap.set(url.toLowerCase(), {
          sourceNode: el,
          url: new URL(url),
        });
      });
    }

    const images = [...backgroundImageMatchesMap.values()].map(
      ({ sourceNode, url }) => {
        const image = new Image();
        image.src = url.toString();
        return { sourceNode, image };
      },
    );

    return images;
  }

  /**
   * Gets `ScrapedImage` from `HTMLImageElement`.
   */
  static async scrapeFromImageElement(
    img: HTMLImageElement,
    sourceNode?: Element,
  ) {
    if (!(await this.isImageValid(img))) return null;

    const url = new URL(img.src);
    const fileName = url.pathname.split("/").pop() ?? "unknown";
    const fileType = fileName.includes(".")
      ? (fileName.split(".").pop() ?? "unknown")
      : "unknown";
    const { naturalWidth, naturalHeight, alt: description } = img;
    sourceNode = sourceNode ?? img;

    return new ScrapedImage({
      url,
      fileName,
      fileType,
      naturalWidth,
      naturalHeight,
      description,
      sourceNode,
    });
  }

  /**
   * Gets `ScrapedImage` from `SVGSVGElement`
   */
  static scrapeFromSVGElement(svg: SVGSVGElement) {
    const serialized = new XMLSerializer().serializeToString(svg);
    const encoded = `data:image/svg+xml;base64,${btoa(serialized)}`;
    const description =
      svg.getAttribute("aria-label") || svg.getAttribute("title") || "unknown";

    return new ScrapedImage({
      type: "svg",
      fileType: "svg",
      sourceNode: svg,
      description,
      naturalHeight: svg.width.baseVal.value || null,
      naturalWidth: svg.height.baseVal.value || null,
      url: new URL(encoded),
      fileName: description,
    });
  }

  /**
   * Checks if an image url or `HTMLImageElement` src is valid.
   */
  static async isImageValid(img: HTMLImageElement | string): Promise<boolean> {
    if (img instanceof HTMLImageElement) {
      return img.complete && img.naturalWidth > 0;
    }

    if (typeof img === "string") {
      const isValidUrl =
        typeof img === "string" &&
        img.length > 0 &&
        !img.startsWith("data:") &&
        !img.startsWith("blob:");

      if (isValidUrl)
        return await new Promise((res) => {
          const image = new Image();
          image.src = img;
          image.onload = () => res(true);
          image.onerror = () => res(false);
          if (image.complete) res(image.naturalWidth > 0);
          else res(false);
        });
    }

    return false;
  }
}

type ScrapedImageKeys = Exclude<
  {
    [K in keyof ScrapedImage]: ScrapedImage[K] extends Function ? never : K;
  }[keyof ScrapedImage],
  undefined
>;
type ScrapedImageOptions = Pick<ScrapedImage, ScrapedImageKeys>;

export class ScrapedImage {
  fileName: string;
  url: URL;
  description?: string;
  naturalWidth?: number | null = null;
  naturalHeight?: number | null = null;
  type?: string;
  fileType: string;
  sourceNode: Node;

  constructor(opts: ScrapedImageOptions) {
    Object.keys(opts).forEach((key) => (this[key] = opts[key]));
  }

  async blob() {
    const res = await fetch(this.url);
    const blob = await res.blob();
    return blob;
  }

  async arrayBuffer() {
    const blob = await this.blob();
    return await blob.arrayBuffer();
  }

  async bytes() {
    const blob = await this.blob();
    return await blob.bytes();
  }
}
