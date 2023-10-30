class App {
  componentsJs = {
    staticJs: "",
    componentMainJs: {},
    instances: {},
  };

  componentImportsCache = {};

  elementCount = -1;
  componentCount = -1;

  constructor(rootFolder, rootFile) {
    this.transpileComponent(rootFolder, rootFile).then(({ html }) => {
      console.log(html);

      let totalJs = this.componentsJs.staticJs;

      for (const className in this.componentsJs.componentMainJs) {
        totalJs += `class ${className} {
            constructor(componentCount, props, childrenString) {
              this.element = document.querySelector("div[data-component-count='" + componentCount + "']");
              this.props = props;
              this.props["element"] = this.element;

              let tempChildrenElement = document.createElement(div);
              tempChildrenElement.innerHTML = childrenString;
              this.children = tempChildrenElement.children;

              this.init();
            }

            ${this.componentsJs.componentMainJs[className].main}
          `;

        for (const setterVariableName in this.componentsJs.componentMainJs[
          className
        ].setters) {
          totalJs += `
          set${capitaliseFirstLetter(setterVariableName)}(newValue) {
            for (const element of this.element.querySelectorAll("variable[name='" + "this.${setterVariableName}" + "']")) {
              element.innerHTML = newValue;
            }

            for (const element of document.querySelectorAll(
              "[data-variable-this-${setterVariableName}]"
            )) {
              const variableValue = element.getAttribute("data-variable-this-${setterVariableName}");
          `;

          if (
            this.componentsJs.componentMainJs[className].setters[
              setterVariableName
            ].length != 0
          ) {
            for (const dynamicPropName of this.componentsJs.componentMainJs[
              className
            ].setters[setterVariableName]) {
              totalJs += `element.setAttribute("${dynamicPropName}", newValue)`;
            }
            totalJs += "}";
          }
          totalJs += "}";
        }

        totalJs += "}";
      }

      console.log(totalJs);
    });
  }

  async transpileComponent(folder, file) {
    const componentHtml = convertToElement(await readFile(folder + "/" + file));

    const { componentName, componentClassName } = await this.getNameDetails(
      componentHtml,
      folder + "/" + file
    );

    const importedComponents = await this.getImports(componentHtml, folder);

    await this.storeClass(componentClassName, componentHtml, folder);

    if (componentClassName.substring(0, 3) != "APP") {
      this.componentsJs.componentMainJs[componentClassName].props =
        this.getProps(componentHtml);
    }

    const html = await this.transpileHtml(
      getElementByTagName(componentHtml, "structure", componentClassName),
      importedComponents,
      componentClassName
    );

    return {
      name: componentName,
      className: componentClassName,
      html,
    };
  }

  async getNameDetails(componentHtml, filePath) {
    const componentTag = getElementByTagName(componentHtml, "component");
    const componentName = componentTag.getAttribute("name");

    return {
      componentName,
      componentClassName:
        componentName.toUpperCase() + (await sha256(filePath)),
    };
  }

  async getImports(componentHtml, folderPath) {
    const importsElement = getElementByTagName(componentHtml, "imports");
    const imports = {};

    if (importsElement) {
      for (const element of importsElement.children) {
        const importSrc =
          folderPath +
          "/" +
          element.getAttribute("folder") +
          "/" +
          element.getAttribute("file");

        let componentDetails = undefined;

        if (this.componentImportsCache[importSrc]) {
          componentDetails = this.componentImportsCache[importSrc];
        } else {
          componentDetails = await this.transpileComponent(
            folderPath + element.getAttribute("folder"),
            element.getAttribute("file")
          );
        }

        imports[componentDetails.name.toUpperCase()] = {
          html: componentDetails.html,
          className: componentDetails.className,
        };
      }
    }

    return imports;
  }

  getProps(componentHtml) {
    const props = {};

    for (const attributeName of getElementByTagName(
      componentHtml,
      "component"
    ).getAttributeNames()) {
      if (attributeName != "name") {
        props[attributeName] = "";
      }
    }

    return props;
  }

  async transpileHtml(parent, imports, componentClassName) {
    let transpileString = "";

    for (const node of parent.childNodes) {
      if (node.nodeName === "#text") {
        transpileString += this.transpileText(
          node.textContent,
          true,
          componentClassName
        );
      } else {
        for (const attributeName of node.getAttributeNames()) {
          if (attributeName[0] == "{") {
            node.setAttribute(
              attributeName.substring(1, attributeName.length - 1),
              this.transpileText(
                node.getAttribute(attributeName),
                false,
                componentClassName
              )
            );
          }
        }

        if (node.tagName === "PAGEBODY") {
          transpileString += changeInnerHtml(
            changeTagName(node, "body"),
            await this.transpileHtml(node, imports, componentClassName)
          ).outerHTML;
        } else if (node.tagName === "PAGEHEAD") {
          transpileString += changeInnerHtml(
            changeTagName(node, "head"),
            await this.transpileHtml(node, imports, componentClassName)
          ).outerHTML;
        } else if (isValidElement(node)) {
          transpileString += changeInnerHtml(
            node,
            await this.transpileHtml(node, imports, componentClassName)
          ).outerHTML;
        } else {
          transpileString += this.getComponentInstance(
            imports[node.tagName].className,
            convertToElement(imports[node.tagName].html)
          );
        }
      }
    }

    return transpileString;
  }

  transpileText(text, inHtml, componentClassName) {
    let readerValue = "";
    let inBrackets = false;
    let bracketString = "";

    //deal with adding setters to this.componentsJs

    if (inHtml) {
      for (const character of text) {
        if (character == "{" || character == "}") {
          inBrackets = !inBrackets;

          if (character == "}") {
            if (bracketString == "this.children") {
              // do something here if this.children
            } else if (
              bracketString.substring(0, "this.props.".length) == "this.props."
            ) {
              // do something if this.props.
            } else {
              const variableName = bracketString.substring("this.".length);

              console.log(bracketString);
              this.componentsJs.componentMainJs[componentClassName].setters[
                variableName
              ] = [];

              readerValue += `<variable name="this.${variableName}"></variable>`;
            }

            bracketString = "";
          }
        } else if (inBrackets && !isWhitespace(character)) {
          bracketString += character;
        } else {
          readerValue += character;
        }
      }
    } else {
    }

    return readerValue;
  }

  getComponentInstance(componentClassName, componentStructure) {
    this.componentCount++;

    this.componentsJs.instances[this.componentCount] = {
      className: componentClassName,
      structure: componentStructure,
      props: {
        attributeUses: {},
        variableUses: [],
      },
      variables: { attributeUses: {}, variableUses: [] },
    };

    return componentStructure.outerHTML;
  }

  async storeClass(componentClassName, componentHtml, folderPath) {
    const jsTag = getElementByTagName(componentHtml, "js");

    if (jsTag) {
      const jsSrc = jsTag.getAttribute("src");

      if (!this.componentsJs.componentMainJs[componentClassName]) {
        this.componentsJs.componentMainJs[componentClassName] = {
          main: "",
          setters: {},
          props: {},
        };
      }

      if (jsSrc) {
        this.componentsJs.componentMainJs[componentClassName].main = (
          await readFile(folderPath + "/" + jsSrc)
        ).replaceAll("function ", "");
      } else {
        this.componentsJs.componentMainJs[componentClassName].main =
          jsTag.innerHTML.replaceAll("function", "");
      }
    }
  }
}
