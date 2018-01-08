'use strict'

import networksetup from '../renderer/utils/networksetup'
import {Menu} from 'electron'
import MenuBar from 'menubar'

const path = require('path')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const menubar = new MenuBar({
  // height: 800,
  // width: 1000,
  height: 400,
  width: 300,
  minHeight: 400,
  minWidth: 300,
  maxHeight: 400,
  maxWidth: 300,
  preloadWindow: true,
  alwaysOnTop: false,
  icon: path.join(__dirname, './cat.png')
})

console.log(path.join(__dirname, './cat.png'))

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

// function createWindow () {
//   /**
//    * Initial window options
//    */
//   const menu = Menu.buildFromTemplate(template)
//   Menu.setApplicationMenu(menu)
//   mainWindow = new BrowserWindow({
//     height: 400,
//     useContentSize: true,
//     width: 300,
//     frame: false
//   })
//
//   mainWindow.loadURL(winURL)
//
//   mainWindow.on('closed', () => {
//     networksetup.removeAll()
//     mainWindow = null
//   })
// }

// app.on('ready', createWindow)
//
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })
//
// app.on('activate', () => {
//   if (mainWindow === null) {
//     createWindow()
//   }
// })
menubar.on('ready', async function () {
  console.log('app is ready')
  // your app code here
  await networksetup.removeAll()
  let menu = Menu.buildFromTemplate([{
    label: '编辑',
    submenu: [{
      label: '撤销',
      accelerator: 'CmdOrCtrl+Z',
      role: 'undo'
    }, {
      label: '重做',
      accelerator: 'Shift+CmdOrCtrl+Z',
      role: 'redo'
    }, {
      type: 'separator'
    }, {
      label: '剪切',
      accelerator: 'CmdOrCtrl+X',
      role: 'cut'
    }, {
      label: '复制',
      accelerator: 'CmdOrCtrl+C',
      role: 'copy'
    }, {
      label: '粘贴',
      accelerator: 'CmdOrCtrl+V',
      role: 'paste'
    }, {
      label: '全选',
      accelerator: 'CmdOrCtrl+A',
      role: 'selectall'
    }, {
      label: '切换工具栏',
      accelerator: 'CmdOrCtrl+Alt+I',
      role: 'toggledevtools'
    }]
  }])
  Menu.setApplicationMenu(menu)
})
menubar.on('after-create-window', function () {
  mainWindow = menubar.window
  mainWindow.loadURL(winURL)
  mainWindow.on('closed', async () => {
    await networksetup.removeAll()
    mainWindow = null
  })
  // menubar.tray.setImage(path.join(__dirname, './cat.png'))
})
