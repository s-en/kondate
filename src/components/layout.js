class NavLayout extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
    <div class="menu_title">menu</div>
    <ul>
    <li>sub1</li>
    <li>sub2</li>
    <li>sub3</li>
    </ul>
    `;
    const css = new CSSStyleSheet();
    css.replace("@import url(../css/layout.css)")
    this.shadowRoot.adoptedStyleSheets = [css];
  }
}
class FooterLayout extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.style.padding = '0px -10px';
    this.shadowRoot.innerHTML = `
    <div class="created">generated by kondate</div>
    <style>
    .created {
      position: absolute;
      width: 100%;
      margin: 0 auto;
      bottom: 10px;
    }
    </style>`;
  }
}
class HeaderLayout extends HTMLElement {
  static get observedAttributes() {
    return ['title'];
  }
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.titleName = '';
  }
  onClick() {
    console.log('onclick');
    window.location.href = 'index.html';
  }
  async attributeChangedCallback(attributeName, oldValue, newValue) {
    if (attributeName === 'title') {
      this.titleName = newValue;
    }
    this.shadowRoot.innerHTML = this.template;
    const logo = this.shadowRoot.getElementById('logo');
    logo.addEventListener('click', this.onClick);
  }
  get template() {
    return `
    <div id="logo">${this.titleName}</div>
    <style>
    #logo {
      position: absolute;
      cursor: pointer;
      font-size: 1.2rem;
      padding: 8px 24px;
      font-weight: 400;
    }
    </syle>
    `;
  }
}

customElements.define('nav-layout', NavLayout);
customElements.define('footer-layout', FooterLayout);
customElements.define('header-layout', HeaderLayout);