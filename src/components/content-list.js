import Headline from './headline-content.js';

const getQuery = () => {
  const query = window.location.search.replace(/^\?/, '').replace(/=$/, '');
  const queries = query.split('=');
  const res = {};
  for(let i = 0; i < queries.length; i+=2) {
    res[queries[i]] = queries[i+1];
  }
  return res;
};

class ContentList extends HTMLElement {
  static get observedAttributes() {
    return ['src'];
  }
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.query = getQuery();
    if(this.query.tags) {
      this.tags = this.query.tags.split(',');
    } else {
      this.tags = [];
    }
  }
  async attributeChangedCallback(attributeName, oldValue, newValue) {
    if (attributeName === 'src') {
      const json = await (await fetch(newValue)).json();
      while (this.shadowRoot.firstChild) {
        this.shadowRoot.removeChild(this.shadowRoot.firstChild);
      }
      for(const fname of Object.keys(json)) {
        if(!this.tags.every(t => json[fname].tags.includes(t))) {
          continue; // skip unmatched contents
        }
        const mk = new Headline();
        mk.title = json[fname].title;
        mk.tags = json[fname].tags;
        mk.src = fname;
        this.shadowRoot.appendChild(mk);
      }
    }
  }
}

customElements.define('content-list', ContentList);