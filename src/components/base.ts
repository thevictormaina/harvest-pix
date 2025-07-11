export class WebComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const constructor = this.constructor as typeof WebComponent;

    if (!this.shadowRoot) return;

    if (constructor.template) {
      const fragment = constructor.template.content.cloneNode(true);
      this.shadowRoot.append(fragment);
      console.log(fragment);
    }

    if (constructor.stylesheets?.length > 0) {
      this.shadowRoot.adoptedStyleSheets = constructor.stylesheets;
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
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    // Override in subclasses to react to attribute changes
  }

  static registeredName: string;

  static template: HTMLTemplateElement;

  static stylesheets: CSSStyleSheet[] = [];

  /**
   * Get the contents of a file.
   */
  static async getFile(
    path: string,
    required: boolean = true,
  ): Promise<string | null> {
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
   */
  static async loadTemplate(
    fileName: string,
    basePath: string = "components/",
  ): Promise<void> {
    if (
      typeof fileName !== "string" ||
      !/^[\w/-]+\.component\.html$/.test(fileName)
    ) {
      throw new Error(`Invalid template file name: ${fileName}`);
    }

    const html = await this.getFile(`${basePath}${fileName}`);
    const template = document.createElement("template");
    if (!template || !html) return;
    template.innerHTML = html;
    this.template = template;
  }

  /**
   * Get the contents of a stylesheet
   */
  static async loadStyleSheet(
    fileName: string,
    basePath: string = "components/",
  ): Promise<void> {
    if (
      typeof fileName !== "string" ||
      !/^[\w/-]+\.component\.css$/.test(fileName)
    ) {
      throw new Error(`Invalid stylesheet file name: ${fileName}`);
    }

    const globalCss = await this.getFile("styles/global.css", false);
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
   */
  static async initialize(basePath: string = "components/"): Promise<void> {
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
