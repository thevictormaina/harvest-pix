const templateCache = new Map<string, DocumentFragment>();

export async function loadComponentTemplate(
  filename: string,
  basePath: string = "components/",
) {
  const path = `${basePath}${filename}`;
  if (templateCache.has(path)) {
    return templateCache.get(path)?.cloneNode(true);
  }

  if (
    typeof filename !== "string" ||
    !/^[\w/-]+\.component\.html$/.test(filename)
  ) {
    throw Error("Please provide a valid file name.");
  }

  const res = await fetch(path);
  if (!res.ok) {
    throw Error(`Component file with name ${filename} does not exist.`);
  }

  const text = await res.text();
  const template = document.createElement("template");
  template.innerHTML = text;

  templateCache.set(path, template.content);
  return template.content.cloneNode(true);
}
