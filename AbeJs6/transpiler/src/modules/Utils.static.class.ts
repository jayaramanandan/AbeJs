import { JSDOM } from "jsdom";
import RulesObject from "./interfaces/RulesObject.interface";
import NodeData from "./interfaces/NodeData.interface";

class Utils {
  constructor() {
    // makes class static
    throw new Error();
  }

  public static initialiseDom(htmlString: string): Document {
    return new JSDOM(htmlString).window.document;
  }

  public static getElementByTagName(
    parent: Document | Element,
    tagName: string
  ): Element {
    return parent.getElementsByTagName(tagName)[0];
  }

  public static errorMessage(message: string): void {
    console.log(message);
    process.exit();
  }

  public static changeInnerHtml(element: Element, newHtml: string): Element {
    element.innerHTML = newHtml;

    return element;
  }

  public static traverseThroughElement(
    parentNode: Element | ChildNode,
    rules: RulesObject
  ): void {
    for (const node of parentNode.childNodes) {
      const nodeData: NodeData = {
        name: node.nodeName,
        type: node.nodeType,
      }; // stores the node data we are interested in (mainly for perfomance)

      this.executeRule(nodeData, node, rules); // executes the rules with conditions

      this.traverseThroughElement(node, rules); // traverses through children elements
    }
  }

  private static executeRule(
    nodeData: { [key: string]: string | number },
    node: ChildNode,
    rules: RulesObject
  ): void {
    // for each node property we are interested in
    for (const dataKey in nodeData) {
      const ruleName: string = `${dataKey} == ${nodeData[dataKey]}`;
      // identifies the key/condition that should be in rules

      if (ruleName in rules) {
        // only executes if the condition has an action in defined rules
        const followedRule: Function | RulesObject = rules[ruleName];

        if (typeof followedRule == "function") {
          followedRule(node);
        } else {
          this.executeRule(nodeData, node, followedRule);
        }
      }
    }
  }
}

export default Utils;
