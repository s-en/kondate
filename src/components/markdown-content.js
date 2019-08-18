import convertMark from '../js/markdown.js';

const prettifyCSSURL = 'https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/prettify.css';
const themeCSSURL = 'https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/skins/sunburst.css';

const getQuery = () => {
  const query = window.location.search.replace(/^\?/, '').replace(/=$/, '');
  const queries = query.split('=');
  const res = {};
  for(let i = 0; i < queries.length; i+=2) {
    res[queries[i]] = queries[i+1];
  }
  return res;
};

class MarkdownContent extends HTMLElement {
  static get observedAttributes() {
    return ['src'];
  }
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    const css = new CSSStyleSheet();
    css.replace("@import url(../css/markdown.css)");
    const prettifyCss = new CSSStyleSheet();
    prettifyCss.replace(`@import url(${prettifyCSSURL})`);
    const themeCss = new CSSStyleSheet();
    themeCss.replace(`@import url(${themeCSSURL})`);
    
    this.shadowRoot.adoptedStyleSheets = [css, prettifyCss, themeCss];
    this.markdown = '';
    this.query = getQuery();
    if(this.query.md) {
      this.attributeChangedCallback('src', '', this.query.md);
    }
  }
  set src(val) {
    this.setAttribute('src', val);
  }
  async attributeChangedCallback(attributeName, oldValue, newValue) {
    this.index = this.index || await (await fetch('../contents.json')).json();
    if (attributeName === 'src') {
      this.fname = newValue;
      const text = await (await fetch(`contents/${newValue}`)).text();
      this.markdown = convertMark(text);
    }
    document.title = this.index[this.fname].title;
    this.shadowRoot.innerHTML = this.template;
  }
  get template() {
    return `
    <h1>${this.index[this.fname].title}</h1>
    ${this.markdown}`;
  }
}

customElements.define('markdown-content', MarkdownContent);