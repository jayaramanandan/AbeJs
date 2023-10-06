async function transpileComponent(folder, file) {
  const componentElement = await getComponentElement(folder, file);
  const { componentName, className } = await getNames(
    componentElement,
    folder,
    file
  );

  const importedComponents = await getImports(
    getElementByTagName(componentElement, "imports"),
    folder
  );

  currentComponentClassName = className;

  await getJs(getElementByTagName(componentElement, "js"), folder);

  const componentHtml = transpileHtml(
    getElementByTagName(componentElement, "structure") ||
      document.createElement("div"),
    importedComponents
  );

  return { componentName, componentHtml };
}

async function getNames(componentElement, folder, file) {
  let componentName = componentElement.getAttribute("name");

  if (!componentName)
    throw new Error(
      "component does not have attribute 'name' - located at: " +
        folder +
        "/" +
        file
    );

  componentName = componentName.toUpperCase();

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

async function getImports(importsElement, currentFolder) {
  const imports = {};

  for (const importElement of (importsElement || document.createElement("div"))
    .children || []) {
    const { componentName, componentHtml } = await transpileComponent(
      currentFolder + importElement.getAttribute("folder"),
      importElement.getAttribute("file")
    );

    imports[componentName] = {
      className: currentComponentClassName,
      componentHtml,
    };
  }

  return imports;
}

function transpileHtml(parent, imports) {
  let transpiledString = "";

  for (const node of parent.childNodes) {
    if (node.nodeName == "#text") {
      transpiledString += transpileText(node.textContent, "html");
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
        componentCount++;
        transpiledString += getComponentString(node, imports);
      }
    }
  }

  return transpiledString;
}

function getComponentString(node, imports) {
  const componentName = node.tagName;

  const childrenString = transpileHtml(node, imports);

  componentsJs["initialisations"] += `component${componentCount}: new ${
    imports[componentName].className
  }(${componentCount},${getPropsString(node)} ,\`${childrenString}\`),`;

  return createElementString(
    "div",
    { "data-component-id": componentCount },
    imports[componentName].componentHtml.replaceAll(
      `<children></children>`,
      childrenString
    )
  );
}

function getPropsString(node) {
  let propsString = "{";

  for (const attributeName of node.getAttributeNames()) {
    if (attributeName.substring(0, 2) == "on") {
      //handle events
    } else {
      propsString += `
      ${attributeName}:"${node.getAttribute(attributeName)}",
      ${"set" + capitaliseFirstLetter(attributeName)}: function (newValue) {
        this.${attributeName} = newValue;

        for (const element of this.element.querySelectorAll("variable[name='this.props.${attributeName}']")) {
          element.innerHTML = newValue;
        }
      }
      `;
    }
  }

  propsString += "}";

  return propsString;
}

function transpileText(textContent, type) {
  let inBrackets = false;
  let readerValue = "";
  let bracketValue = "";

  for (const character of textContent) {
    if (character == "{" || character == "}") {
      inBrackets = !inBrackets;

      if (character == "}") {
        bracketValue = bracketValue.trim();

        if (bracketValue == "this.children") {
          readerValue += `<children></children>`;
        } else {
          readerValue += `<variable name="${bracketValue}"></variable>`;

          if (
            bracketValue.substring(0, "this.props.".length) != "this.props."
          ) {
            const variableName = bracketValue.substring("this.".length);
            componentsJs[currentComponentClassName].variableSetters[
              "set" + capitaliseFirstLetter(variableName)
            ] = `
          this.${variableName} = newValue;
          for (const element of this.element.querySelectorAll("variable[name='${bracketValue}']")) {
            element.innerHTML = newValue;
          }
          `;
          }
        }
      }
    } else if (inBrackets) {
      bracketValue += character;
    } else {
      readerValue += character;
    }
  }

  return readerValue;
}

async function getJs(jsTag, folder) {
  let jsString = "";

  if (jsTag) {
    const jsSrc = jsTag.getAttribute("src");
    if (jsSrc) {
      jsString = await readFile(folder + "/" + jsSrc);
    } else {
      jsString = jsTag.innerHTML;
    }
  }

  componentsJs[currentComponentClassName] = {
    main: jsString.replaceAll("function", ""),
    variableSetters: {},
  };
}
