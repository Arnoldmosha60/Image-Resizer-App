// window.addEventListener('DOMContentLoaded', () => {
//     const replaceText = (selector, text) => {
//       const element = document.getElementById(selector)
//       if (element) element.innerText = text
//     }
  
//     for (const type of ['chrome', 'node', 'electron']) {
//       replaceText(`${type}-version`, process.versions[type])
//     }
//   })

const {contextBridge, ipcRenderer} = require('electron');
const os = require('os');
const path = require('path');
const Toastify = require('react-toastify')

contextBridge.exposeInMainWorld('os', {
  homedir: () => os.homedir()
})

contextBridge.exposeInMainWorld('path', {
  join: (...args) => path.join(...args), 
})

contextBridge.exposeInMainWorld('Toastify', {
  toast: (options) =>  Toastify(options).showToast(),
})

contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)) ,
})