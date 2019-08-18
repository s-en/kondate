const renderer = new marked.Renderer();

export default function(text, headline) {
  if(headline) {
    const ary = text.split('\n');
    text = ary.splice(0, Math.min(15, ary.length)).join('\n');
  }
  renderer.heading = (text, level) => {
    if(headline) {
      level = Math.min(5, level+3);
    }
    return `<h${level}>${text}</h${level}>`;
  }
  renderer.code = (code, infostring) => {
    if (infostring === 'lang-html') {
      code = escapeHtml(code);
    }
    return `<pre class="prettyprint"><code class="${infostring}">${PR.prettyPrintOne(code, infostring, false)}</code></pre>`;
  }
  return marked(text, {renderer});
}

function escapeHtml(str) {
  return str.replace(/[&'`"<>]/g, function(char) {
    return {
      '&': '&amp;',
      "'": '&#x27;',
      '`': '&#x60;',
      '"': '&quot;',
      '<': '&lt;',
      '>': '&gt;',
    }[char]
  });
}