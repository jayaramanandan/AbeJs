import { JSDOM } from "jsdom";
import path from "path";
import cliProgress, { SingleBar } from "cli-progress";

import RulesObject from "./interfaces/RulesObject.interface";
import NodeData from "./interfaces/NodeData.interface";
import PathDetails from "./interfaces/PathDetails.interface";

class Utils {
  private static bar: SingleBar;

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

  public static errorMessage(message: string, filePath: string): void {
    console.error(`Error ${message}\n\nOccurred at (${filePath})`);
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

  public static getPathStringDetails(src: string): PathDetails {
    const { dir, base, name } = path.parse(src);
    return {
      src,
      name,
      folder: dir,
      file: base,
    };
  }

  public static startProgressBarCmd(maxValue: number): void {
    /*
    this.bar = new cliProgress.SingleBar(
      {},
      cliProgress.Presets.shades_classic
    );

    this.bar.start(maxValue, 0);*/
  }

  public static addProgressToBarCmd(progress: number): void {
    /*
    this.bar.update(progress);*/
  }

  public static stopProgressBarCmd(): void {
    /*
    this.bar.update(this.bar.getTotal());
    this.bar.stop();
    console.log("\n");*/
  }

  public static toHtml(text: string): Element {
    // creates an element to hold html
    const carrierElement: Element = this.initialiseDom("").createElement("div");

    // puts the html text into carrier (converts text to html)
    carrierElement.innerHTML = text;

    return carrierElement;
  }
}

export default Utils;
