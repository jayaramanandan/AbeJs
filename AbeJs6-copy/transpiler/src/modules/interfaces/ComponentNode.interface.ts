import Component from "../Component.class";

interface ComponentNode extends Element {
  referenceComponent: Component;
  addTranspiledString: Function;
}

export default ComponentNode;
