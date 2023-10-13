async function readFile(path) {
  return await (await fetch("/files?path=app/" + path)).text();
}

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

async function sha256(message) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(message))
    )
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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
