"use strict";

const { parseFragment } = require("../../browser/parser");
const { HTML_NS } = require("../helpers/namespaces.js");
const { isShadowRoot } = require("../helpers/shadow-dom.js");
const NODE_TYPE = require("../node-type.js");

// const { fragmentSerialization } = require("./serialization.js");

function extractInnerText(node, window) {
  if (node.nodeType === NODE_TYPE.TEXT_NODE) {
    return node.data;
  }

  if (node.nodeType === NODE_TYPE.ELEMENT_NODE && (node.localName === "script" || node.localName === "style")) {
    return "";
  }
  if (node.nodeType === NODE_TYPE.ELEMENT_NODE && node.localName === "br") {
    return "\n";
  }

  const style = window.getComputedStyle(node);
  if (style.display === "none" || style.opacity === "0" || style.visibility === "hidden") {
    return "";
  }


  let text = "";
  for (const child of node.childNodes) {
    text += extractInnerText(child);
  }
  // Add a newline character if the element is a block-level element or has a forced line break
  const blockLevelElements =
    [
      "address", "article", "aside", "blockquote", "details", "dialog", "dd", "div", "dl", "dt", "fieldset",
      "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hgroup", "hr", "li",
      "main", "nav", "ol", "p", "pre", "section", "table", "ul"
    ];
  if (blockLevelElements.includes(node.localName) || style.whiteSpace === "pre" || style.whiteSpace === "pre-wrap") {
    text += "\n";
  }

  return text;
}

exports.implementation = class InnerTextImpl {
  get innerText() {
    const window = this._ownerDocument._defaultView;
    return extractInnerText(this, window);
    // return fragmentSerialization(this, {
    //   outer: false,
    //   requireWellFormed: true,
    //   globalObject: this._globalObject
    // });
  }

  set innerText(text) {
    const contextElement = isShadowRoot(this) ? this.host : this;
    const fragment = parseFragment(text, contextElement);

    let contextObject = this;
    if (this.nodeType === NODE_TYPE.ELEMENT_NODE && this.localName === "template" && this.namespaceURI === HTML_NS) {
      contextObject = this._templateContents;
    }

    contextObject._replaceAll(fragment);
  }
};
