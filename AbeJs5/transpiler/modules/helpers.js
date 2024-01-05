const path = require("path");
const fs = require("fs");
const { createHash } = require("crypto");
const document = new (require("jsdom").JSDOM)("").window.document;

module.exports = {
  getSrcDetails: (srcString) => {
    const parsedPath = path.parse(srcString);

    return {
      src: srcString,
      file: parsedPath.base,
      folder: parsedPath.dir,
    };
  },

  getElementByTagName: (parent, tagName) => {
    return parent.getElementsByTagName(tagName)[0];
  },

  replaceAllOccurences: (text, mapObj) => {
    const regEx = new RegExp(Object.keys(mapObj).join("|"), "gi");

    return text.replaceAll(regEx, function (matched) {
      return mapObj[matched];
    });
  },

  isValidElement: (element) => {
    return element.toString() != "[object HTMLUnknownElement]";
  },

  sha256: (message) => {
    return Buffer.from(
      createHash("sha256").update(message).digest("hex")
    ).toString("hex");
  },

  changeTagName: (element, newTagName) => {
    const newElement = document.createElement(newTagName);

    for (const attributeName of element.getAttributeNames()) {
      newElement.setAttribute(
        attributeName,
        element.getAttribute(attributeName)
      );
    }

    newElement.innerHTML = element.innerHTML;

    return newElement;
  },

  changeInnerHtml: (element, newInnerHtml) => {
    element.innerHTML = newInnerHtml;
    return element;
  },

  createFolder: (folderPath) => {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
  },

  cloneClassInstance: (classInstance) => {
    return Object.assign(
      Object.create(Object.getPrototypeOf(classInstance)),
      classInstance
    );
  },

  toHtml: (text) => {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = text;

    return tempElement;
  },
};
