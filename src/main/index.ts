import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

// Use path.join for the icon path
const icon = join(__dirname, '../../resources/icon.png')

let mainWindow: BrowserWindow | null = null
let movableGoalsWindow: BrowserWindow | null = null

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    // Replace loadFile with loadURL
    mainWindow.loadURL(`file://${join(__dirname, '../renderer/index.html')}`)
  }

  // Open DevTools if in development mode
  if (is.dev) {
    mainWindow.webContents.openDevTools()
  }
}

function createMovableGoalsWindow(goals: string[]): void {
  if (!mainWindow) {
    console.error('Main window does not exist')
    return
  }

  movableGoalsWindow = new BrowserWindow({
    width: 300,
    height: 200,
    parent: mainWindow,
    frame: false,
    resizable: false,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  movableGoalsWindow.loadURL(`file://${join(__dirname, '../renderer/index.html')}#/movable-goals`)

  movableGoalsWindow.webContents.on('did-finish-load', () => {
    movableGoalsWindow?.webContents.send('update-goals', goals)
    movableGoalsWindow?.show()
  })

  movableGoalsWindow.on('closed', () => {
    movableGoalsWindow = null
  })

  // Position the window in the bottom-right corner of the main window
  const [width, height] = mainWindow.getSize()
  movableGoalsWindow.setPosition(width - 320, height - 220)

  // Update the movable goals window position when the main window is resized
  mainWindow.on('resize', () => {
    if (movableGoalsWindow) {
      const [newWidth, newHeight] = mainWindow!.getSize()
      movableGoalsWindow.setPosition(newWidth - 320, newHeight - 220)
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Handle opening movable goals window
  ipcMain.on('open-movable-goals-window', (_event, goals) => {
    if (!movableGoalsWindow) {
      createMovableGoalsWindow(goals)
    } else {
      movableGoalsWindow.webContents.send('update-goals', goals)
      movableGoalsWindow.show()
    }
  })

  // Add a handler to close the movable goals window
  ipcMain.on('close-movable-goals-window', () => {
    if (movableGoalsWindow && mainWindow) {
      mainWindow.removeBrowserView(movableGoalsWindow)
      movableGoalsWindow = null
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here
