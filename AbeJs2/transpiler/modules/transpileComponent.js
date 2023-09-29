async function transpileComponent(folder, file) {
  const componentElement = await getComponentElement(folder, file);
  const { componentName, className } = await getNames(
    componentElement,
    folder,
    file
  );

  const importedComponents = await getImports(
    getElementByTagName(componentElement, "imports"),
    componentName,
    folder
  );

  await getJs(getElementByTagName(componentElement, "js"), folder, className);

  currentComponentClassName = className;

  const componentHtml = transpileHtml(
    getElementByTagName(componentElement, "structure") ||
      document.createElement("div"),
    importedComponents
  );

  return componentHtml;
}

async function getNames(componentElement, folder, file) {
  const componentName = componentElement.getAttribute("name");
  if (!componentName)
    throw new Error(
      "component does not have attribute 'name' - located at: " +
        folder +
        "/" +
        file
    );

  return {
    componentName,
    className: componentName + (await sha256(folder + file)),
  };
}

async function getComponentElement(folder, file) {
  const componentElement = getElementByTagName(
    changeInnerHtml(
      document.createElement("div"),
      await readFile(folder + "/" + file)
    ),
    "component"
  );

  if (!componentElement)
    throw new Error("No component element found in " + folder + "/" + file);

  return componentElement;
}

async function getImports(importsElement, componentName, currentFolder) {
  const imports = {};

  for (const importElement of (importsElement || document.createElement("div"))
    .children || []) {
    imports[componentName] = await transpileComponent(
      currentFolder + importElement.getAttribute("folder"),
      importElement.getAttribute("file")
    );
  }

  return imports;
}

function transpileHtml(parent, imports) {
  let transpiledString = "";

  for (const node of parent.childNodes) {
    if (node.nodeName == "#text") {
      transpiledString += transpileTextNode(node.textContent);
    } else {
      if (node.tagName == "PAGEHEAD") {
        transpiledString += changeInnerHtml(
          changeTagName(node, "head"),
          transpileHtml(node, imports)
        ).outerHTML;
      } else if (node.tagName == "PAGEBODY") {
        transpiledString += changeInnerHtml(
          changeTagName(node, "body"),
          transpileHtml(node, imports)
        ).outerHTML;
      } else if (isValidElement(node)) {
        transpiledString += changeInnerHtml(
          node,
          transpileHtml(node, imports)
        ).outerHTML;
      } else {
      }
    }
  }

  return transpiledString;
}

function transpileTextNode(textContent) {
  //continue this
  return textContent;
}

async function getJs(jsTag, folder, className) {
  let jsString = "";

  if (jsTag) {
    const jsSrc = jsTag.getAttribute("src");
    if (jsSrc) {
      jsString = await readFile(folder + "/" + jsSrc);
    } else {
      jsString = jsTag.innerHTML;
    }
  }

  componentsJs[className] = {
    main: jsString.replaceAll("function", ""),
    variableSetters: {},
    props: {},
  };
}
