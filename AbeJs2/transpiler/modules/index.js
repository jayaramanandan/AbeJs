/*
this.props X
this.set...html content X
this.element X
this.children (dynamic) X
replace {} with actual value X
make props unqiue to all instances of an element
this.set... props content
dynamic events
sub structures
styles
*/

const helperModulesJs = `
function stringToHtml(htmlString) {
  const tempElement = document.createElement("div");
  tempElement.innerHTML = htmlString;

  return tempElement.children;
}

class Component {
  constructor(componentId, props, childrenString) {
    this.element = document.querySelector("div[data-component-id='" + componentId + "']");
    this.children = stringToHtml(childrenString);
    this.props = props;
    this.props["element"] = this.element;

    this.init();
  }
}
`;
var componentsJs = {
  initialisations: "var components = {",
};
var currentComponentClassName = "";
var componentCount = -1;

async function main() {
  const page = document.createElement("html");
  page.innerHTML = (await transpileComponent("", "App.html")).componentHtml;
  page.appendChild(transpileJs());

  deleteVars();

  document.removeChild(getElementByTagName(document, "html"));
  document.appendChild(page);
}

function transpileJs() {
  componentsJs["initialisations"] += "};";
  let jsString = "";

  for (const componentClassName in componentsJs) {
    if (componentsJs[componentClassName].main != "") {
      if (componentClassName != "initialisations") {
        jsString += `
      class ${componentClassName} extends Component {
        constructor(...args) {
          super(...args);
         
        }
  
        ${componentsJs[componentClassName].main}
        ${getVariableSettersString(componentClassName)}
      }
    `;
      }
    }
  }

  return changeInnerHtml(
    document.createElement("script"),
    helperModulesJs + jsString + componentsJs["initialisations"]
  );
}

function getVariableSettersString(componentClassName) {
  let variableSettersString = "";

  for (const key in componentsJs[componentClassName].variableSetters) {
    variableSettersString += `${key} (newValue) {${componentsJs[componentClassName]["variableSetters"][key]}}`;
  }

  return variableSettersString;
}

function deleteVars() {
  componentsJs = undefined;
  currentComponentClassName = undefined;
  componentCount = undefined;

  delete componentsJs;
  delete currentComponentClassName;
  delete componentCount;
}

main();
