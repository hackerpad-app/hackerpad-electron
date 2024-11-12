import { app, shell, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let tray: Tray | null = null
let isQuitting = false
let trayText = 'Hi'

function createTray(mainWindow: BrowserWindow): void {
  const trayIcon = nativeImage.createFromPath(icon)
  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }))

  const contextMenu = Menu.buildFromTemplate([
    { type: 'separator' },
    {
      label: 'Quit Hackerpad',
      click: () => {
        isQuitting = true
        app.quit()
      }
    }
  ])

  // Set initial title and context menu
  tray.setTitle('Hi 00:00')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    if (!mainWindow.isVisible()) {
      mainWindow.show()
      mainWindow.focus()
    } else {
      if (!mainWindow.isFocused()) {
        mainWindow.focus()
      }
    }
  })
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
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

  // Create tray after window is created
  createTray(mainWindow)

  // Set up IPC listener for timer updates
  ipcMain.on('update-tray-timer', (_event, time: string) => {
    if (tray) {
      const displayTime =
        process.platform === 'darwin' ? ` ${trayText} ${time}` : `${trayText} ${time}`
      tray.setTitle(displayTime)
    }
  })

  // New IPC listener for updating the text
  ipcMain.on('update-tray-text', (_event, text: string) => {
    trayText = text
    // Trigger a refresh of the tray title if needed
    mainWindow.webContents.send('request-timer-update')
  })

  console.log('mainWindow', mainWindow)
  // Modify window close behavior
  mainWindow.on('close', (event) => {
    console.log('close', isQuitting)
    if (!isQuitting) {
      console.log('preventing default')
      event.preventDefault()
      mainWindow.hide()
    }
    return false
  })

  // Load the index.html file
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.hackerpad.app')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

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

app.on('before-quit', () => {
  isQuitting = true
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here
