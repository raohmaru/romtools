/**
 * Fast query selector.
 * @param {string} selector - Valid CSS selector
 * @param {Element} [root=document] - Element on which run the query
 * @returns {Element}
 */
export function $(selector, root) {
    const element = root || document;
    if (selector[0] === '#') {
        return document.getElementById(selector.slice(1));
    }
    return element.querySelector(selector);
}

/**
 * Shortcut for document.querySelectorAll().
 * @param {string} selector - Valid CSS selector
 * @param {Element} [root=document] - Element on which run the query
 * @returns {NodeList}
 */
export function $$(selector, root) {
    const element = root || document;
    return element.querySelectorAll(selector);
}

/**
 *  Parses a string of HTML into a DocumentFragment or Element.
 * @param {*} htmlString - String containing HTML to parse
 * @returns {HTMLCollection|Element} - Parsed HTML as a NodeList or Element
 */
export function parseDOMString(htmlString) {
    const docFrag = document.createRange().createContextualFragment(htmlString);
    if (docFrag.childElementCount.length > 1) {
        return docFrag.children;
    }
    return docFrag.firstElementChild;
}
