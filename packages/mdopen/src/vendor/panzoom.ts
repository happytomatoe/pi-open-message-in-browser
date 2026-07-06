export const PANZOOM_SCRIPT = `
var mmd = (() => {
  var loaded = false

  var walk = (regex, string, result = [], match = regex.exec(string)) =>
    !match ? result : walk(regex, string, result.concat(match[1]))

  return {
    render: () => {
      if (loaded) {
        var definitions = walk(/<pre><code class="mermaid">([\\s\\S]+?)<\\/code><\\/pre>/gi, document.querySelector('#_html')?.innerHTML || '')

        Array.from(document.querySelectorAll('pre code.mermaid')).forEach((diagram, index) => {
          diagram.removeAttribute('data-processed')
          diagram.innerHTML = definitions[index]
        })
      }
      var isDark = document.body.classList.contains('_color-dark')
      var theme = isDark ? 'dark' : 'default'
      mermaid.initialize({theme})
      mermaid.init({theme}, 'code.mermaid')
      loaded = true

      var diagrams = Array.from(document.querySelectorAll('code.mermaid'))
      var timeout = setInterval(() => {
        var svg = Array.from(document.querySelectorAll('pre code.mermaid svg'))
        if (diagrams.length === svg.length) {
          clearInterval(timeout)
          svg.forEach((diagram) => {
            var panzoom = Panzoom(diagram, {canvas: true})
            diagram.parentElement.parentElement.addEventListener('wheel', (e) => {
              if (!e.shiftKey) return
              panzoom.zoomWithWheel(e)
            })
          })
        }
      }, 50)
    }
  }
})()
`;
