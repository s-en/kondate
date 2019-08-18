import Headline from './headline-content.js';

class ContentList extends HTMLElement {
  static get observedAttributes() {
    return ['src'];
  }
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  async attributeChangedCallback(attributeName, oldValue, newValue) {
    if (attributeName === 'src') {
      const json = await (await fetch(newValue)).json();
      while (this.shadowRoot.firstChild) {
        this.shadowRoot.removeChild(this.shadowRoot.firstChild);
      }
      for(const fname of Object.keys(json)) {
        const mk = new Headline();
        mk.title = json[fname].title;
        mk.src = fname;
        this.shadowRoot.appendChild(mk);
      }
    }
  }
}

customElements.define('content-list', ContentList);