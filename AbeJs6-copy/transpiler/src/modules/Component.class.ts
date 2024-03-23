import Utils from "./Utils.static.class";
import ComponentNode from "./interfaces/ComponentNode.interface";
import Imports from "./interfaces/Imports.interface";
import NodeData from "./interfaces/NodeData.interface";
import RulesObject from "./interfaces/RulesObject.interface";

class Component {
  public componentNode: ComponentNode;
  public imports: Imports = {};
  private transpiledHtml: string = "";
  private nodeData: NodeData;
  private rules: RulesObject;

  constructor(
    componentNode: Element | ChildNode,
    imports: Imports,
    rules: RulesObject
  ) {
    this.componentNode = componentNode as ComponentNode;
    this.imports = imports;
    this.rules = rules;
    this.componentNode["referenceComponent"] = this;

    // transpiles children nodes first
    let transpiledInnerHtml: string = "";
    for (const node of this.componentNode.childNodes) {
      transpiledInnerHtml += new Component(
        node,
        this.imports,
        this.rules
      ).getTranspiledHtml();
    }
    this.componentNode.innerHTML = transpiledInnerHtml;

    this.nodeData = {
      name: componentNode.nodeName,
      hasValidName: Utils.isValidElement(componentNode),
      type: componentNode.nodeType,
    }; // stores only the relevant node data we are interested in (mainly for perfomance)

    this.executeRule(this.rules);
  }

  private executeRule(rules: RulesObject): void {
    // traverses through interested node properties
    for (const nodeProperty in this.nodeData) {
      const followedRule: RulesObject | Function | undefined =
        // @ts-ignore
        rules[`${nodeProperty} == ${this.nodeData[nodeProperty]}`];

      if (followedRule) {
        if (typeof followedRule == "function") {
          // executes corresponding action
          this.transpiledHtml = followedRule(this.componentNode);
        } else {
          this.executeRule(followedRule);
        }

        break;
      }
    }
  }

  public getTranspiledHtml(): string {
    return this.transpiledHtml;
  }
}

export default Component;
