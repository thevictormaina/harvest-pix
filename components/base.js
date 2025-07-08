export class WebComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    if (this.constructor.template) {
      const fragment = this.constructor.template.content.cloneNode(true);
      this.shadowRoot.append(fragment);
    }

    if (this.constructor.stylesheets?.length > 0) {
      this.shadowRoot.adoptedStyleSheets = this.constructor.stylesheets;
    }

    this.connectedMoveCallback();
  }

  disconnectedCallback() {
    // Override in subclasses to handle disconnection
  }

  connectedMoveCallback() {
    // Called on both connect and when node is moved in DOM
    // Override in subclasses if needed
  }

  adoptedCallback() {
    this.connectedMoveCallback();
  }

  /**
   * Called when one of the observed attributes changes.
   * Subclasses should define `static get observedAttributes() { return [...] }`
   */
  attributeChangedCallback(name, oldValue, newValue) {
    // Override in subclasses to react to attribute changes
  }

  /** @type {string} */
  static registeredName;

  /** @type {HTMLTemplateElement} */
  static template;

  /** @type {CSSStyleSheet[]} */
  static stylesheets = [];

  /**
   * Get the contents of a file.
   * @param {string} path
   * @param {boolean} required - `true` by default
   * @returns {Promise<string|null>}
   */
  static async getFile(path, required = true) {
    try {
      const res = await fetch(path);
      if (!res.ok) {
        if (required) throw new Error(`Failed to fetch: ${path}`);
        return null;
      }
      return await res.text();
    } catch (err) {
      if (required) throw err;
      return null;
    }
  }

  /**
   * Get the contents of a template file
   * @param {string} fileName - Must be a `*.component.html` file.
   * @param {string} basePath
   * @returns {Promise<void>}
   */
  static async loadTemplate(fileName, basePath = "components/") {
    if (
      typeof fileName !== "string" ||
      !/^[\w/-]+\.component\.html$/.test(fileName)
    ) {
      throw new Error(`Invalid template file name: ${fileName}`);
    }

    const html = await this.getFile(`${basePath}${fileName}`);
    const template = document.createElement("template");
    template.innerHTML = html;
    this.template = template;
  }

  /**
   * Get the contents of a stylesheet
   * @param {string} fileName - Must be a `*.component.css` file.
   * @param {string} basePath
   * @returns {Promise<void>}
   */
  static async loadStyleSheet(fileName, basePath = "components/") {
    if (
      typeof fileName !== "string" ||
      !/^[\w/-]+\.component\.css$/.test(fileName)
    ) {
      throw new Error(`Invalid stylesheet file name: ${fileName}`);
    }

    const globalCss = await this.getFile("global.css", false);
    if (globalCss) {
      const globalSheet = new CSSStyleSheet();
      await globalSheet.replace(globalCss);
      this.stylesheets = [...this.stylesheets, globalSheet];
    }

    const css = await this.getFile(`${basePath}${fileName}`, false);
    if (css) {
      const sheet = new CSSStyleSheet();
      await sheet.replace(css);
      this.stylesheets = [...this.stylesheets, sheet];
    }
  }

  /**
   * Loads and caches the component's template and stylesheet
   * based on its static `registeredName`.
   * @param {string} basePath - Relative path to component files (default: "components/")
   * @returns {Promise<void>}
   */
  static async initialize(basePath = "components/") {
    if (!this.registeredName) {
      throw new Error(
        `${this.name}.registeredName must be set before calling initialize().`,
      );
    }

    const htmlFile = `${this.registeredName}.component.html`;
    const cssFile = `${this.registeredName}.component.css`;

    // Load and store template
    if (!this.template) {
      await this.loadTemplate(htmlFile, basePath);
    }

    // Load and store stylesheet (optional)
    if (!this.stylesheets || this.stylesheets.length === 0) {
      await this.loadStyleSheet(cssFile, basePath);
    }
  }
}
