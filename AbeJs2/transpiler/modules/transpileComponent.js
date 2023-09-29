async function transpileComponent(folder, file) {
  const component = changeInnerHtml(
    document.createElement("div"),
    await readFile(folder + "/" + file)
  );

  const importedComponents = {};

  for (const importElement of (
    true && getElementByTagName(component, "imports")
  ).children || []) {
    console.log(importElement);
  }
}
