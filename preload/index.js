const { run, fetchConfigFromUI } = require('./move_util')

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

})
