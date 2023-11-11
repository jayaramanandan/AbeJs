const { JSDOM } = require("jsdom");

const Component = require("./component");
const { readFile, getSrcDetails, tsCompile } = require("../helpers");
const { addApp } = require("./appManager");

class App {
  componentCount = 0;
  components = {};
  script = `
  function changeElementAttributes(element, attributes) {
    for (const attributeName in attributes) {
      element.setAttribute(attributeName, attributes[attributeName]);
    }
  }
  `;

  constructor(rootSrc) {
    addApp(this);

    const { folder, file } = getSrcDetails(rootSrc);

    this.configs = JSON.parse(readFile(folder + "/" + "config.json"));
    this.PORT = this.configs["port"];

    this.document = new JSDOM(readFile(rootSrc)).window.document;

    this.readFile = (src) => readFile(folder + "/" + src);

    this.rootComponent = new Component(file, true).instantiate(
      this.document.createElement("div")
    );

    this.script += "var components = {";

    for (const componentId in this.components) {
      this.script += `component${componentId}: new ${this.components[componentId].className},`;
    }

    this.script += "};";
  }

  getPageHtml() {
    const page = this.document.createElement("html");
    page.innerHTML = this.rootComponent.html.outerHTML;
    page.innerHTML += `<script>${tsCompile(this.script)}</script>`;

    return page.outerHTML;
  }
}

module.exports = App;
