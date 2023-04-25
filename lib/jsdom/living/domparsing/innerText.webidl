interface mixin InnerText {
  [CEReactions] attribute [LegacyNullToEmptyString] DOMString innerText;
  // No w3c spec for innerText as for innerHTML
};

Element includes InnerText;
ShadowRoot includes InnerText;
