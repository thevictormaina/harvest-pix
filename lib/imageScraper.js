export class ImageScraper {
  /**
   * Scrape <img> and <picture> elements
   */
  static getImageTags() {
    const results = [];
    const imgElements = document.querySelectorAll("img[src], picture img");

    for (const img of imgElements) {
      const url = img.currentSrc || img.src;
      if (!this.#isValidUrl(url)) continue;

      results.push({
        url,
        description: img.alt || null,
        naturalWidth: img.naturalWidth || null,
        naturalHeight: img.naturalHeight || null,
        type: "img",
      });
    }

    return results;
  }

  /**
   * Scrape inline <svg> elements
   */
  static getInlineSVGs() {
    const results = [];
    const svgs = document.querySelectorAll("svg");

    for (const svg of svgs) {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const encoded = `data:image/svg+xml;base64,${btoa(svgString)}`;

      results.push({
        url: encoded,
        description:
          svg.getAttribute("aria-label") || svg.getAttribute("title") || null,
        naturalWidth: null,
        naturalHeight: null,
        type: "svg",
      });
    }

    return results;
  }

  /**
   * Scrape background images set via CSS
   */
  static async getBackgroundImages() {
    const results = [];

    const elements = [...document.querySelectorAll("*")];
    for (const el of elements) {
      const bg = getComputedStyle(el).backgroundImage;
      const matches = [...bg.matchAll(/url\(["']?(.*?)["']?\)/g)];
      for (const match of matches) {
        const url = match[1];
        if (!this.#isValidUrl(url)) continue;

        const description =
          el.getAttribute("aria-label") || el.getAttribute("title") || null;
        try {
          const { naturalWidth, naturalHeight } = await this.#getImageSize(url);
          results.push({
            url,
            description,
            naturalWidth,
            naturalHeight,
            type: "background",
          });
        } catch {
          results.push({
            url,
            description,
            naturalWidth: null,
            naturalHeight: null,
            type: "background",
          });
        }
      }
    }

    return results;
  }

  /**
   * Run all scraping functions and return deduplicated results
   */
  static async getAll() {
    const all = [
      ...this.getImageTags(),
      ...this.getInlineSVGs(),
      ...(await this.getBackgroundImages()),
    ];

    const seen = new Set();
    const deduped = [];

    for (const item of all) {
      const key = item.url.trim().toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(item);
    }

    return deduped;
  }

  // === Private Helpers ===

  static #isValidUrl(url) {
    return (
      typeof url === "string" &&
      url.length > 0 &&
      !url.startsWith("data:") &&
      !url.startsWith("blob:")
    );
  }

  static #getImageSize(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () =>
        resolve({
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        });
      img.onerror = reject;
      img.src = url;
    });
  }
}
