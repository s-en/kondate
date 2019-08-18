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
  set tags(val) {
    this.setAttribute('tags', val);
  }
  async attributeChangedCallback(attributeName, oldValue, newValue) {
    if (attributeName === 'src') {
      const content = await (await fetch(`contents/${newValue}`)).text();
      const markdown = convertMark(content, true);
      let tags = this.getAttribute('tags');
      if(tags) {
        tags = tags.split(',').map(t => {
          return `<div class="badge">${t}</div>`;
        });
        tags = tags.join('');
      } else {
        tags = '';
      }
      const html = `
      <div class="card">
        <div class="title">${this.getAttribute('title')}</div>
        <div class="content">${markdown}</div>
        <div class="footer">${tags}</div>
      </div>`
      this.shadowRoot.innerHTML = html;
      const badges = this.shadowRoot.querySelectorAll('.badge');
      for(const b of badges) {
        b.addEventListener('click', this.onClickTag(b.innerHTML));
      }
    }
  }
  onClick(event) {
    window.location.href = `contents.html?md=${this.getAttribute('src')}`;
    event.stopPropagation();
  }
  onClickTag(tag) {
    return (event) => {
      window.location.href = `index.html?tags=${tag}`;
      event.stopPropagation();
    }
  }
}

customElements.define('headline-content', Headline);

export default Headline;