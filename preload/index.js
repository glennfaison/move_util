const { run, fetchConfigFromUI, ft } = require('./move_util')

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }

  const submitButton = document.getElementById('submitButton')
  submitButton.addEventListener('click', e => {
    const substring = document.getElementsByName('substring')[0].value
    const sourceFolder = document.getElementsByName('sourceFolder')[0].value
    const destinationFolder = document.getElementsByName('destinationFolder')[0].value

    const config = fetchConfigFromUI({substring, sourceFolder, destinationFolder})

    run(config)
  })

  const createDiv = (innerHtml) => {
    const div = document.createElement('div')
    div.innerHTML = innerHtml
    return div
  }

  const logsSpan = document.getElementById('logs')
  ft.on('message', (msg) => {
    logsSpan.appendChild(createDiv(msg))
  })
  ft.on('error', (msg) => {
    logsSpan.appendChild(createDiv(msg).style.color = 'red')
  })
  ft.on('start', (msg) => {
    logsSpan.appendChild(createDiv(msg))
  })
  ft.on('end', (msg) => {
    logsSpan.appendChild(createDiv(msg))
  })

})
