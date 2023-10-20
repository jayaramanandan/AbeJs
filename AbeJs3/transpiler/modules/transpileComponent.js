class App {
  componentsJs = {
    staticJs: "",
    componentMainJs: {
      main: "",
      setters: {
        name: "",
      },
    },
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

            ${(() => {
              let setterString = "";

              for (const setterName of this.componentsJs.componentMainJs[
                className
              ].setters) {
                setterString +=
                  setterName +
                  "() {" +
                  this.componentsJs.componentMainJs[className].setters[
                    setterName
                  ] +
                  "}";
              }

              return setterString;
            })()}
          }`;
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

    const html = await this.transpileHtml(
      getElementByTagName(componentHtml, "structure", componentClassName),
      importedComponents
    );

    await this.storeClass(componentClassName, componentHtml, folder);

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

  async transpileHtml(parent, imports, componentClassName) {
    let transpileString = "";

    for (const node of parent.childNodes) {
      if (node.nodeName === "#text") {
        transpileString += this.transpileText(node.textContent, true);
      } else {
        for (const attributeName of node.getAttributeNames()) {
          node.setAttribute(
            attributeName,
            this.transpileText(node.getAttribute(attributeName), false)
          );
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

  transpileText(text, inHtml) {
    let readerValue = "";

    //deal with adding setters to this.componentsJs

    if (inHtml) {
      for (const character of text) {
        if (character == "{") {
          readerValue += '<variable name="';
        } else if (character == "}") {
          readerValue += '"></variable>';
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

      if (jsSrc) {
        this.componentsJs.componentMainJs[componentClassName].main =
          await readFile(folderPath + "/" + jsSrc).replaceAll("function ", "");
      } else {
        this.componentsJs.componentMainJs[componentClassName].main =
          jsTag.innerHTML.replaceAll("function", "");
      }
    }
  }
}
