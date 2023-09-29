async function transpileComponent(folder, file) {
  const component = await getComponentFromString(folder, file);

  globalScriptString += component.js;

  return component;
}

async function getComponentFromString(folder, file) {
  const tempHolder = changeInnerHtml(
    document.createElement("div"),
    await readFile(folder + "/" + file)
  );

  const cssTag = getElementByTagName(tempHolder, "css");
  const name = getElementByTagName(tempHolder, "component").getAttribute(
    "name"
  );
  const imports = await getImports(
    getElementByTagName(tempHolder, "imports"),
    folder
  );

  if (!name)
    throw new Error(
      "Component does not have a 'name' attribute\n" + tempHolder.innerHTML
    );

  const className = name + (await sha256(folder + file));

  currentComponentClassName = className;

  const structureHtml = transpileHtml(
    getElementByTagName(tempHolder, "structure"),
    imports
  );

  return {
    name,
    className,
    structure: structureHtml,
    css: cssTag ? cssTag.innerHTML : "",
    js: await getJs(getElementByTagName(tempHolder, "js"), folder, className),
  };
}

async function getJs(jsTag, folder, className) {
  if (!jsTag) return "";

  const jsSrc = jsTag.getAttribute("src");
  // workout a way to get variable  setterMethods from html dynamic variable string

  return `
  class ${className}{
    element = document.querySelector("[componentId='${componentId}']");

    constructor (componentId, props) {
      this.props = props;
      this.props["element"] = this.element;
      this.props.setAll();
      if (this.init) this.init();
    }

    ${(jsSrc
      ? await readFile(folder + "/" + jsSrc)
      : jsTag.innerHTML
    ).replaceAll("function ", "")}

    ${componentSetterFunctions[className]}
  }`;
}

async function getImports(importsElement, currentFolder) {
  const foundImports = {};

  if (importsElement && importsElement.children.length != 0) {
    for (const importElement of importsElement.children) {
      const importFolder =
        currentFolder + "/" + importElement.getAttribute("folder");
      const importedComponent = await transpileComponent(
        importFolder,
        importElement.getAttribute("file")
      );

      foundImports[importedComponent.name.toUpperCase()] = {
        html: importedComponent.structure,
        className: importedComponent.className,
      };
    }
  }

  return foundImports;
}

function transpileHtml(parent, imports) {
  let transpileString = "";

  for (node of parent.childNodes) {
    if (node.nodeName == "#text") {
      let inBrackets = false;
      let variableName = "";

      for (const character of node.textContent) {
        if (character == "{" || character == "}") {
          inBrackets = !inBrackets;
          if (character == "}") {
            if (
              variableName.substring(0, "this.props.".length) != "this.props."
            ) {
              const setterString = `set${capitaliseFirstLetter(
                variableName.substring("this.".length, variableName.length)
              )}(newValue){${variableName}=newValue; for (const element of this.element.querySelectorAll("variable[name='${variableName}']")) {
                element.innerHTML = newValue;
              }}`;

              if (componentSetterFunctions[currentComponentClassName]) {
                componentSetterFunctions[currentComponentClassName] +=
                  setterString;
              } else {
                componentSetterFunctions[currentComponentClassName] =
                  setterString;
              }
            }
            transpileString += `<variable name=${variableName}></variable>`;

            variableName = "";
          }
        } else if (inBrackets) {
          if (
            character != " " &&
            character != "\r" &&
            character != "\n" &&
            character != "\t"
          ) {
            variableName += character;
          }
        } else {
          transpileString += character;
        }
      }
    } else {
      elementsId++;
      node.setAttribute("data-element-id", elementsId);

      /*
      for (attributeName of node.getAttributeNames()) {
        let inBrackets = false;
        let variableName = "";


        for (const character of node.getAttribute(attributeName)) {
          if (character == "{" || character == "}") {
            inBrackets = !inBrackets;
            if (character == "}") {
              variableName = "";
              const functionString = ``;
              if (componentPropSetterFunctions[currentComponentClassName]) {
                componentPropSetterFunctions[currentComponentClassName] =
                  functionString;
              } else {
                componentPropSetterFunctions[currentComponentClassName] +=
                  functionString;
              }
              if (
                variableName.substring(0, "this.props.".length) == "this.props"
              ) {
              } else {
              }
            }
          }
          if (inBrackets) {
            variableName += character;
          }
        }
      }*/

      if (node.tagName == "PAGEHEAD") {
        transpileString += changeInnerHtml(
          changeTagName(node, "head"),
          transpileHtml(node, imports)
        ).outerHTML;
      } else if (node.tagName == "PAGEBODY") {
        transpileString += changeInnerHtml(
          changeTagName(node, "body"),
          transpileHtml(node, imports)
        ).outerHTML;
      } else if (isValidElement(node)) {
        transpileString += changeInnerHtml(
          node,
          transpileHtml(node, imports)
        ).outerHTML;
      } else {
        transpileString += addComponent(imports[node.tagName], node);
        componentCount++;
      }
    }
  }

  return transpileString;
}

function addComponent({ html, className }, node) {
  const attributes = { componentId: componentCount };
  let propsString = "{";
  let setAllFunctionString = "setAll:function(){";

  for (const attributeName of node.getAttributeNames()) {
    const attributeValue = node.getAttribute(attributeName);

    if (
      attributeName.substring(0, 1) == "on" ||
      attributeName == "style" ||
      attributeName == "data-element-id"
    ) {
      attributes[attributeName] = attributeValue;
    }

    /*

    propsString += `"${attributeName}":"${attributeValue}", "set${capitaliseFirstLetter(
      attributeName
    )}":function(newValue) {
      this.${attributeName} = newValue;
      for (const element of this.element.querySelectorAll("variable[name='this.props.${attributeName}']")) {
        element.innerHTML = newValue;
      }
    },`;

    setAllFunctionString += `
    for (const element of this.element.querySelectorAll("variable[name='this.props.${attributeName}']")) {
      element.innerHTML = "${attributeValue}";
    }`;*/
  }

  globalScriptString += `var component${componentCount}=new ${className}(${componentCount}, ${propsString}${setAllFunctionString}}});`;
  return createElementString("div", attributes, html);
}
/*
<div>
  <var name="cheese"></var>
</div>*/
