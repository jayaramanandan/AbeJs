class Component {
  componentHtml = document.createElement("div");
  folder = undefined;
  imports = {};

  componentId = app.componentCount;
  name = undefined;
  className = undefined;
  js = undefined;
  html = document.createElement("div");
  props = {};

  async create(componentImportPath, isRoot) {
    app.componentCount++;

    if (isRoot) {
      this.html = document.createElement("html");
    }

    this.html.setAttribute("data-component-id", this.componentId);

    await this.importComponentHtml(componentImportPath);

    await this.getExternalImports();

    this.html.innerHTML = this.transpileHtml(
      getElementByTagName(this.componentHtml, "structure")
    );

    await this.transpileJs();

    return this;
  }

  async importComponentHtml(path) {
    this.componentHtml.innerHTML = await readFile(path);

    this.folder = getSrcDetails(path).folder;

    this.name = getElementByTagName(this.componentHtml, "component")
      .getAttribute("name")
      .toUpperCase();

    this.className = this.name + (await sha256());
  }

  async getExternalImports() {
    const importsTag = getElementByTagName(this.componentHtml, "imports");

    if (importsTag) {
      for (const importElement of importsTag.children) {
        const importedComponent = await new Component().create(
          importElement.getAttribute(this.folder + "src")
        );

        this.imports[importedComponent.name] = importedComponent;
      }
    }
  }

  transpileHtml(parent) {
    let transpiledString = "";

    for (const node of parent.childNodes) {
      if (node.nodeName == "#text") {
        transpiledString += node.textContent;
      } else {
        for (const attributeName of node.getAttributeNames()) {
          if (attributeName[0] == "{") {
            if (attributeName[attributeName.length - 1] == "}") {
            } else {
              throw new Error(`
              ${node.outerHTML}
              has invalid dynamic attribute: '${attributeName}'
              `);
            }
          }
        }

        if (node.tagName == "PAGEHEAD") {
          transpiledString += changeInnerHtml(
            changeTagName(node, "head"),
            this.transpileHtml(node)
          ).outerHTML;
        } else if (node.tagName == "PAGEBODY") {
          transpiledString += changeInnerHtml(
            changeTagName(node, "body"),
            this.transpileHtml(node)
          ).outerHTML;
        } else if (isValidElement(node)) {
          transpiledString += changeInnerHtml(
            node,
            this.transpileHtml(node)
          ).outerHTML;
        } else {
          transpiledString += this.imports[node.tagName].html.outerHTML;
        }
      }
    }

    return transpiledString;
  }

  async transpileJs() {
    const jsTag = getElementByTagName(this.componentHtml, "js");
    let mainJs = "";

    if (jsTag) {
      const jsSrc = jsTag.getAttribute("src");

      mainJs = jsSrc
        ? await readFile(this.folder + "/" + jsSrc)
        : jsTag.innerHTML;

      mainJs = mainJs.replaceAll("function ", "");
    }

    this.js = `
    class ${this.className} {
      props = {
        element: this.element,
        ${joinString(this.props.propNames, (propName) => {
          return `
            set${capitaliseFirstLetter(propName)}: function(newValue) {
              for (const element of this.element.querySelectorAll("variable[name='this.props.${propName}']")) {
                element.innerHTML = newValue;
              }

              this.element.querySelector()
              ${this.props.}
            }
            `;
        })}
      }

      constructor(componentId, props) {
        this.element = docment.querySelector("[data-component-id='" + componentId + "']");
        Object.assign(, props)

        (true && this.init)();
      }
    }
    `;
  }
}
