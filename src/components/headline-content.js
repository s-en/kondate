import convertMark from '../js/markdown.js';

class Headline extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'title', 'tags'];
  }
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    const css = new CSSStyleSheet();
    css.replace("@import url(../css/headline.css)")
    this.shadowRoot.adoptedStyleSheets = [css];
    this.addEventListener('click', this.onClick);
  }
  set src(val) {
    this.setAttribute('src', val);
  }
  set title(val) {
    this.setAttribute('title', val);
  }
  async attributeChangedCallback(attributeName, oldValue, newValue) {
    if (attributeName === 'src') {
      const content = await (await fetch(`contents/${newValue}`)).text();
      const markdown = convertMark(content, true);
      const html = `
      <div class="card">
        <div class="title">${this.getAttribute('title')}</div>
        <div class="content">${markdown}</div>
      </div>`
      this.shadowRoot.innerHTML = html;
    }
  }
  onClick(event) {
    window.location.href = `contents.html?md=${this.getAttribute('src')}`;
  }
}

customElements.define('headline-content', Headline);

export default Headline;