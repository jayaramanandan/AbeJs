const { createHash } = require("crypto");
const { readFileSync } = require("fs");
const path = require("path");
const ts = require("typescript");
const { JSDOM } = require("jsdom");

const document = new JSDOM("").window.document;

function getElementByTagName(parent, tagName) {
  return parent.getElementsByTagName(tagName)[0];
}

function isValidElement(element) {
  return element.toString() != "[object HTMLUnknownElement]";
}

function changeInnerHtml(element, newInnerHtml) {
  element.innerHTML = newInnerHtml;
  return element;
}

function changeTagName(element, newTagName) {
  const newElement = document.createElement(newTagName);

  for (const attributeName of element.getAttributeNames()) {
    newElement.setAttribute(attributeName, element.getAttribute(attributeName));
  }

  newElement.innerHTML = element.innerHTML;

  return newElement;
}

function createElementString(tagName, attributes, innerHtml) {
  const newElement = document.createElement(tagName);

  for (const attributeName in attributes) {
    newElement.setAttribute(attributeName, attributes[attributeName]);
  }

  newElement.innerHTML = innerHtml;

  return newElement.outerHTML;
}

function sha256(message) {
  return Buffer.from(
    createHash("sha256").update(message).digest("hex")
  ).toString("hex");
}

function capitaliseFirstLetter(string) {
  return string[0].toUpperCase() + string.slice(1);
}

function camelCasePropString(propString) {
  let readerValue = "";
  let prevCharacterIsHyphen = false;

  for (const character of propString) {
    if (prevCharacterIsHyphen) {
      readerValue += character.toUpperCase();
    } else if (character != "-") {
      readerValue += character;
    }

    prevCharacterIsHyphen = character == "-";
  }

  return readerValue;
}

function replaceAllElements(htmlElement, querySelector, newElementString) {
  for (const element of htmlElement.querySelectorAll(querySelector)) {
    element.outerHTML = newElementString;
  }

  return htmlElement;
}

function convertToElement(htmlString) {
  const tempElement = document.createElement("div");
  tempElement.innerHTML = htmlString;

  return tempElement;
}

function isWhitespace(character) {
  return (
    character == "\n" ||
    character == " " ||
    character == "\t" ||
    character == "\r"
  );
}

function getSrcDetails(srcString) {
  const parsedPath = path.parse(srcString);

  return {
    file: parsedPath.base,
    folder: parsedPath.dir,
  };
}

function joinString(iteratingArray, stringFunction) {
  let returnString = "";

  for (const item of iteratingArray) {
    returnString += stringFunction(item);
  }

  return returnString;
}

function tsCompile(source, options) {
  if (!options) {
    options = { compilerOptions: { module: ts.ModuleKind.CommonJS } };
  }
  return ts.transpileModule(source, options).outputText;
}

function readFile(filePath) {
  return readFileSync(path.join(__dirname, "../", filePath), "utf-8");
}

module.exports = {
  getElementByTagName,
  isValidElement,
  changeInnerHtml,
  changeTagName,
  createElementString,
  sha256,
  capitaliseFirstLetter,
  camelCasePropString,
  replaceAllElements,
  convertToElement,
  isWhitespace,
  getSrcDetails,
  joinString,
  tsCompile,
  readFile,
};
