var componentCount = 0;
var elementsId = 0;
var globalScriptString = "";
var importsCache = {};
var currentComponentClassName = "";
var componentSetterFunctions = {};
var componentPropSetterFunctions = {};

async function main() {
  const newHtml = changeInnerHtml(
    document.createElement("html"),
    (await transpileComponent("", "App.html")).structure
  );
  newHtml.appendChild(
    changeInnerHtml(document.createElement("script"), globalScriptString)
  );

  document.removeChild(document.getElementsByTagName("html")[0]);

  document.appendChild(newHtml);

  componentCount = undefined;
  globalScriptString = undefined;
  importsCache = undefined;
  currentComponentClassName = undefined;
  componentSetterFunctions = undefined;
  delete componentCount;
  delete globalScriptString;
  delete importsCache;
  delete currentComponentClassName;
  delete componentSetterFunctions;
}

main();

//test js
