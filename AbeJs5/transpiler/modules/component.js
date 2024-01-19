const fs = require("fs");
const path = require("path");
const JSDOM = require("jsdom").JSDOM;
const child_process = require("child_process");
const helpers = require("./helpers");
const outSrc = path.join(__dirname, "../out");

class Component {
  componentHtml;
  srcDetails;
  imports = {};
  rootComponent;
  name;
  className;
  componentId;
  html;

  constructor(rootComponent, filePath) {
    if (rootComponent || filePath) {
      this.rootComponent = rootComponent ? rootComponent : this;
      this.srcDetails = helpers.getSrcDetails(filePath);

      this.getComponentHtml();
      this.getComponentNameDetails();
      this.getImports();
      this.html = this.transpileHtml(
        helpers.getElementByTagName(this.componentHtml, "structure")
      );

      this.transpileJs();
    }
  }

  getComponentHtml() {
    this.componentHtml = helpers.toHtml(
      fs.readFileSync(this.srcDetails.src, "utf8")
    );
  }

  getComponentNameDetails() {
    const componentTag = helpers.getElementByTagName(
      this.componentHtml,
      "component"
    );
    if (!componentTag) {
      throw new Error(`No '<component>' tag detected (${this.srcDetails.src})`);
    }

    this.name = componentTag.getAttribute("name").toUpperCase();
    if (!this.name) {
      throw new Error(
        `No 'name' attribute on component ${this.srcDetails.src}`
      );
    }

    this.className = this.name + helpers.sha256(this.srcDetails.src);
  }

  getImports() {
    const importsElement = helpers.getElementByTagName(
      this.componentHtml,
      "imports"
    );

    if (!importsElement) return;

    for (const importTag of importsElement.children) {
      const importSrc = importTag.getAttribute("src");

      if (!importSrc) {
        throw new Error(
          `No 'src' attribute for import (${this.srcDetails.src})`
        );
      }

      const importedComponent = new Component(
        this.rootComponent,
        path.join(this.srcDetails.folder, importSrc)
      );

      this.imports[importedComponent.name] = importedComponent;
    }
  }

  transpileHtml(parentNode) {
    let transpiledString = "";

    for (const node of parentNode.childNodes) {
      if (node.nodeName == "#text") {
        transpiledString += node.textContent;
      } else if (node.tagName == "FOLDER") {
        const folderPath = node.getAttribute("path");

        if (!folderPath) {
          throw new Error(
            `No 'path' attribute on '<folder>' component (${this.srcDetails.src})`
          );
        }

        node.folder = path.join("" && parentNode.folder, folderPath);

        this.transpileHtml(node);
      } else if (node.tagName == "FILE") {
        let fileContents = this.transpileHtml(node);

        if (!node.getAttribute("static") == "") {
          fileContents = helpers.getElementByTagName(
            new JSDOM(fileContents, { runScripts: "dangerously" }).window
              .document,
            "html"
          ).textContent;
        }

        const writeFolder = path.join(outSrc, parentNode.folder);

        if (!fs.existsSync(writeFolder)) {
          fs.mkdirSync(writeFolder);
        }

        fs.writeFileSync(
          path.join(writeFolder, node.getAttribute("name")),
          fileContents
        );
      } else if (node.tagName == "COMMANDS") {
        node.folder = "" && parentNode.folder;
        this.transpileHtml(node);
      } else if (node.tagName == "COMMAND") {
        child_process.execSync(node.textContent, {
          cwd: path.join(outSrc, parentNode.folder),
          stdio: "inherit",
        });
      } else if (node.tagName == "PAGEHTML") {
        transpiledString += helpers.changeInnerHtml(
          helpers.changeTagName(node, "html"),
          this.transpileHtml(node)
        ).outerHTML;
      } else if (node.tagName == "PAGEHEAD") {
        transpiledString += helpers.changeInnerHtml(
          helpers.changeTagName(node, "head"),
          this.transpileHtml(node)
        ).outerHTML;
      } else if (node.tagName == "PAGEBODY") {
        transpiledString += helpers.changeInnerHtml(
          helpers.changeTagName(node, "body"),
          this.transpileHtml(node)
        ).outerHTML;
      } else if (helpers.isValidElement(node)) {
        transpiledString += helpers.changeInnerHtml(
          node,
          this.transpileHtml(node)
        ).outerHTML;
      } else {
        const componentCopy = Object.assign(
          new Component(),
          this.imports[node.tagName]
        );

        if (parentNode.tagName == "FILE") {
          // root of app, isntantiate component with app root type
          componentCopy.instantiate(true);
        } else {
          componentCopy.instantiate(false);
        }

        transpiledString += componentCopy.html;
      }
    }

    return transpiledString;
  }

  transpileJs() {}

  instantiate(isRootApp, props, children) {
    //set root component some way.
    if (isRootApp) {
      this.componentCount = 0;
      this.componentId = 0;
      this.rootComponent = undefined;
    } else {
      this.rootComponent.incrementComponentCount();
      this.componentId = this.rootComponent.componentCount;
    }

    this.html = `
    <div data-component-id="${this.componentId}">${this.html}</div>
    `;
  }

  incrementComponentCount() {
    this.componentCount++;
  }
}

module.exports = { Component };
