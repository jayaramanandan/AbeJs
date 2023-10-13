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
  getComponentProps(componentElement);

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

function getComponentProps(componentElement) {
  for (const attributeName of componentElement.getAttributeNames()) {
    if (attributeName != "name" && attributeName != "data-element-id") {
      const propName = camelCasePropString(attributeName);

      componentsJs[currentComponentClassName].propsBlueprint[propName] =
        "undefined";
      componentsJs[currentComponentClassName].propsBlueprint[
        "set" + capitaliseFirstLetter(propName)
      ] = `
      this.${propName} = newValue;
      for (const element of this.element.querySelectorAll("variable[name='this.props.${propName}']")) {
          element.innerHTML = newValue;
      }
      `;
    }
  }
}

function transpileHtml(parent, imports) {
  let transpiledString = "";

  for (const node of parent.childNodes) {
    if (node.nodeName == "#text") {
      transpiledString += transpileText(node.textContent, "html");
    } else {
      for (const attributeName of node.getAttributeNames()) {
        if (attributeName[0] == "{") {
          const attributeNameInsideBrackets = attributeName.substring(
            1,
            attributeName.length - 1
          );
          const { variables, setterString } = getVariablesFromString(
            node.getAttribute(attributeName)
          );

          node.removeAttribute(attributeName);

          node.setAttribute(attributeNameInsideBrackets, setterString);

          for (const propName of variables.propsVariables) {
            componentsJs[currentComponentClassName].propsBlueprint[
              `set${capitaliseFirstLetter(propName)}`
            ] += `this.element.querySelector("[data-element-id='${elementCount}']").setAttribute(\`${attributeNameInsideBrackets}\`, \`${setterString}\`);`;
          }
        }

        if (!node.getAttribute("data-element-id")) {
          node.setAttribute("data-element-id", elementCount);
          elementCount++;
        }
      }

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

function getVariablesFromString(text) {
  let inBrackets = false;
  let variableName = "";
  let readerValue = "";
  let variables = { propsVariables: [], normalVariables: [] };

  for (const character of text) {
    if (character == "{" || character == "}") {
      inBrackets = !inBrackets;

      if (character == "}") {
        if (variableName.substring(0, "this.props.".length) == "this.props.") {
          variables.propsVariables.push(
            variableName.substring("this.props.".length)
          );
        } else {
          variables.normalVariables.push(
            variableName.substring("this.".length)
          );
        }

        variableName = "";
      }
    } else if (inBrackets) {
      variableName += character;
    } else {
      readerValue += character;
    }
  }

  return { variables, setterString: readerValue };
}

function getComponentString(node, imports) {
  const componentName = node.tagName;
  const componentClassName = imports[componentName].className;

  const childrenString = transpileHtml(node, imports);
  const { propsString, propsObject } = getPropsStringAndObject(
    node,
    componentsJs[componentClassName].propsBlueprint
  );

  componentsJs[
    "initialisations"
  ] += `component${componentCount}: new ${componentClassName}(${componentCount},${propsString} ,\`${childrenString}\`),`;

  return createElementString(
    "div",
    { "data-component-id": componentCount },
    replacePropsAndChildren(
      imports[componentName].componentHtml,
      propsObject,
      childrenString
    )
  );
}

function replacePropsAndChildren(componentHtml, propsObject, childrenString) {
  let tempComponentHtmlHolder = document.createElement("div");
  tempComponentHtmlHolder.innerHTML = componentHtml;

  tempComponentHtmlHolder = replaceAllElements(
    tempComponentHtmlHolder,
    "children",
    childrenString
  );

  for (const propName in propsObject) {
    tempComponentHtmlHolder = replaceAllElements(
      tempComponentHtmlHolder,
      `variable[name='this.props.${propName}']`,
      propsObject[propName]
    );
  }

  return tempComponentHtmlHolder.innerHTML;
}

function getPropsStringAndObject(node, componentPropsBlueprint) {
  let propsString = "{";
  const propsObject = {};

  for (const attributeName of node.getAttributeNames()) {
    if (attributeName.substring(0, 2) == "on") {
    } else if (attributeName != "data-element-id") {
      const propName = camelCasePropString(attributeName);
      const propValue = node.getAttribute(attributeName);

      propsObject[propName] = propValue;

      const setterFunctionName = "set" + capitaliseFirstLetter(propName);

      propsString += `
      "${propName}": "${propValue}",
      "${setterFunctionName}": function (newValue) { 
        ${componentPropsBlueprint[setterFunctionName]}
      },
      `;
    }
  }

  for (const propName in componentPropsBlueprint) {
    if (propName.substring(0, "set".length) != "set") {
      if (!propsObject[propName]) {
        propsObject[propName] = "undefined";
      }
    }
  }

  propsString += "}";

  return { propsString, propsObject };
}

function transpileText(textContent) {
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

        bracketValue = "";
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
    propsBlueprint: {},
  };
}
