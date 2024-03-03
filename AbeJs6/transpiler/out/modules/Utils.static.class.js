"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom_1 = require("jsdom");
class Utils {
    constructor() {
        // makes class static
        throw new Error();
    }
    static initialiseDom(htmlString) {
        return new jsdom_1.JSDOM(htmlString).window.document;
    }
    static getElementByTagName(parent, tagName) {
        return parent.getElementsByTagName(tagName)[0];
    }
    static errorMessage(message) {
        console.log(message);
        process.exit();
    }
    static changeInnerHtml(element, newHtml) {
        element.innerHTML = newHtml;
        return element;
    }
    static traverseThroughElement(parentNode, rules) {
        let transpiledString = "";
        for (const node of parentNode.childNodes) {
            const nodeData = {
                name: node.nodeName,
                type: node.nodeType,
            };
            this.executeRule(nodeData, node, rules);
            this.traverseThroughElement(node, rules);
            /*
            transpiledString += this.changeInnerHtml(
              node,
              this.traverseThroughElement(node, rules)
            );*/
        }
        return transpiledString;
    } //continue
    static executeRule(nodeData, node, rules) {
        for (const dataKey in nodeData) {
            const ruleName = `${dataKey} == ${nodeData[dataKey]}`;
            if (ruleName in rules) {
                const followedRule = rules[ruleName];
                if (typeof followedRule == "function") {
                    followedRule(node);
                }
                else {
                    this.executeRule(nodeData, node, followedRule);
                }
            }
        }
    }
}
exports.default = Utils;
