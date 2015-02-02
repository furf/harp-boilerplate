;(function(document) {

'use strict';


/**
 * Reference to Array concat method, used with reduce to flatten arrays.
 * @type {Function}
 */
var concat = Array.prototype.concat;


/**
 * Reference to Array filter method, used to filter Array-like objects.
 * @type {Function}
 */
var filter = Array.prototype.filter;


/**
 * Reference to Array map method, used to map Array-like objects.
 * @type {Function}
 */
var map = Array.prototype.map;


/**
 * Reverse lookup for font weight names.
 * @type {Object}
 */
var fontWeightMap = {
  '100': 'Thin',
  '300': 'Light',
  '400': 'Regular',
  '500': 'Medium',
  '600': 'Semibold',
  '700': 'Bold',
  '800': 'ExtraBold',
  '900': 'Black',
  'normal': 'Regular',
  'bold': 'Bold'
};


/**
 * Sample text for font demos.
 * @type {String}
 */
var LOREM_IPSUM = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.';


// Run.
main();


/**
 * Create a font demo and add to page.
 */
function main() {
  prependChild(document.body, createFontDemoFragment());
}


/**
 * Create a font demo from @font-face rules of a document.
 * @return {DocumentFragment} [description]
 */
function createFontDemoFragment() {
  
  var fragment = document.createDocumentFragment();

  // Pluck CSS @font-face rules from stylesheets
  var rules = map.call(document.styleSheets, pluckCSSFontFaceRules)
    // Remove empty sets
    .filter(hasLength);

  if (rules.length) {
    
    // Flatten arrays of @font-face rules
    rules.reduce(concat)
      // Convert @font-face rules to HTML demos
      .map(convertCSSFontFaceRuleToDemo)
      // Compose demos on a single fragment
      .reduce(buildFragment, fragment);
  }
  
  return fragment;
}


/**
 * Pluck valid @font-face rules from a CSS stylesheet.
 * @param {CSSStyleSheet} styleSheet Stylesheet to filter
 * @return {Array.<CSSFontFaceRule>} array of @font-face rules
 */
function pluckCSSFontFaceRules(styleSheet) {
  return styleSheet.rules ? filterCSSFontFaceRules(styleSheet.rules) : [];
}


/**
 * Filter valid @font-face rules from a CSS stylesheet's rule list.
 * @param {CSSRuleList} rule Stylesheet rules to filter
 * @return {Array.<CSSFontFaceRule>} array of @font-face rules
 */
function filterCSSFontFaceRules(rules) {
  return filter.call(rules, isCSSFontFaceRule);
}


/**
 * Determine if a CSS rule is a valid @font-face rule.
 * @param {CSSRule} rule CSS rule to evaluate
 * @return {Boolean} true if CSS rule is a valid @font-face rule
 */
function isCSSFontFaceRule(rule) {
  return rule instanceof CSSFontFaceRule;
} 


/**
 * Determine if an array has one or more members.
 * @param {Array} array Array to evaluate
 * @return {Boolean} true if Array has one or more members
 */
function hasLength(array) {
  return array.length > 0;
}


/**
 * Convert a CSS @font-face rule to a font example.
 * @param {CSSFontFaceRule} rule @font-face rule to convert
 * @return {DocumentFragment} Document fragment containing font example
 */
function convertCSSFontFaceRuleToDemo(rule) {

  var style = rule.style;
  var fontFamily = style.fontFamily;
  var fontStyle;
  var fontWeight;
  var fragment;
  var header;
  var headerStyle;
  var mappedFontWeight;
  var p;
  var pStyle;

  // Error if invalid family. 
  if (!fontFamily) {
    console.error('Invalid font family.');
    return;
  }

  // Use normal weight if not specified.
  fontWeight = style.fontWeight || 400;
  mappedFontWeight = fontWeightMap[fontWeight];

  // Error if invalid weight.
  if (!mappedFontWeight) {
    console.error('Invalid font weight "%s".', fontWeight);
    return;
  }

  // Use normal style if not specified.
  fontStyle = style.fontStyle || 'normal';
  
  // Create header
  header = document.createElement('h2'); 
  headerStyle = header.style;
  headerStyle.fontFamily = 'sans-serif';
  headerStyle.fontWeight = 'normal';
  headerStyle.fontStyle = 'normal';
  headerStyle.fontSize = '12px';
  headerStyle.lineHeight = '1.25em';
  headerStyle.color = '#777';
  headerStyle.margin = '0 0 .25em';
  header.appendChild(document.createTextNode([
    normalize(fontFamily),
    normalize(mappedFontWeight),
    (fontStyle === 'normal') ? '' : capitalize(fontStyle)
  ].join(' ')));
  
  
  // Create paragraph
  p = document.createElement('p');
  pStyle = p.style;
  pStyle.fontFamily = fontFamily;
  pStyle.fontWeight = fontWeight;
  pStyle.fontStyle = fontStyle;
  pStyle.fontSize = '24px';
  pStyle.lineHeight = '1.25em';
  pStyle.margin = '.25em 0 1.25em';
  p.appendChild(document.createTextNode(LOREM_IPSUM));

  // Compose content
  fragment = document.createDocumentFragment();
  fragment.appendChild(header);
  fragment.appendChild(p);  
  
  return fragment;
}


/**
 * Convert a camelCase string to headline case.
 * @param {String} str String to normalize
 * @return {String} Normalized string
 */
function normalize(str) {
  return capitalize(str.replace(/([a-z])?([A-Z])/g, function(match, lower, upper) {
    return (lower ? lower + ' ' : '') + upper;
  }));
}


/**
 * Capitalize the first character of a string.
 * @param {String} str String to capitalize
 * @return {String} Capitalized string
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.substr(1);
}


/**
 * Convert a camelCase string to hyphenated case.
 * @param {String} str String to hyphenate
 * @return {String} Hyphenated string
 */
function hyphenate(str) {
  return str.replace(/([a-z])?([A-Z])/g, function(match, lower, upper) {
    return (lower ? lower + '-' : '') + upper;
  }).toLowerCase();
}


/**
 * Append a child fragment to a parent fragment and return the parent, used with
 * reduce to compose multiple fragments.
 * @param {HTMLElement|DocumentFragment} parent Parent element or fragment
 * @param {HTMLElement|DocumentFragment} child Child element or fragment
 * @return {HTMLElement|DocumentFragment} Parent element or fragment
 */
function buildFragment(parent, child) {
  parent.appendChild(child);
  return parent;
}


/**
 * Prepend a child element to a parent element.
 * @param {HTMLElement|DocumentFragment} parent Parent element or fragment
 * @param {HTMLElement|DocumentFragment} child Child element or fragment
 * @return {HTMLElement|DocumentFragment} Child element or fragment
 */
function prependChild(parent, child) {
  return parent.insertBefore(child, parent.firstChild);
}


})(document);