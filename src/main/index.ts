import { app, shell, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let mainWindow: BrowserWindow | null = null
let goalsWindow: BrowserWindow | null = null

let tray: Tray | null = null
let isQuitting = false
let trayText = 'Hi'

ipcMain.on('show-goals-window', () => {
  if (!goalsWindow) {
    createGoalsWindow(mainWindow)
  }
  goalsWindow?.show()
})

ipcMain.on('hide-goals-window', () => {
  goalsWindow?.hide()
})

function createTray(mainWindow: BrowserWindow): void {
  const trayIcon = nativeImage.createFromPath(icon)
  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }))

  const contextMenu = Menu.buildFromTemplate([
    { type: 'separator' },
    {
      label: 'Quit Hackerpad',
      click: (): void => {
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

function createGoalsWindow(parentWindow: BrowserWindow): void {
  if (!parentWindow) {
    console.error('Cannot create goals window: No parent window provided')
    return
  }

  const isFullScreen = parentWindow.isFullScreen()

  goalsWindow = new BrowserWindow({
    width: 400,
    height: 48,
    frame: false,
    show: false,
    transparent: true,
    resizable: false,
    acceptFirstMouse: true,
    backgroundColor: '#00000000',
    parent: parentWindow,
    modal: false,
    movable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,
    hasShadow: false,
    fullscreenable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: true
    }
  })

  if (process.platform === 'darwin') {
    goalsWindow.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
      skipTransformProcessType: true
    })
  }

  goalsWindow.setAlwaysOnTop(true, 'screen-saver', 1)

  goalsWindow.setWindowButtonVisibility(false)

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    goalsWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/movable-goals.html`)
  } else {
    goalsWindow.loadFile(join(__dirname, '../renderer/movable-goals.html'))
  }

  // Position relative to parent initially and handle fullscreen
  goalsWindow.once('ready-to-show', () => {
    if (parentWindow && !parentWindow.isDestroyed()) {
      const isFullScreen = parentWindow.isFullScreen()

      if (isFullScreen) {
        // Get the display where the parent window is
        const display = require('electron').screen.getDisplayMatching(parentWindow.getBounds())
        const { workArea } = display

        // Position in the center of the screen
        goalsWindow?.setPosition(workArea.x + workArea.width / 2 - 200, workArea.y + 100)
      } else {
        // Normal positioning relative to parent
        const [parentX, parentY] = parentWindow.getPosition()
        const [parentWidth] = parentWindow.getSize()
        goalsWindow?.setPosition(parentX + parentWidth / 2 - 200, parentY + 100)
      }
      goalsWindow?.show()
    }
  })

  // Handle parent window fullscreen changes
  parentWindow.on('enter-full-screen', () => {
    if (goalsWindow && !goalsWindow.isDestroyed()) {
      const display = require('electron').screen.getDisplayMatching(parentWindow.getBounds())
      const { workArea } = display
      goalsWindow.setPosition(workArea.x + workArea.width / 2 - 200, workArea.y + 100)
    }
  })

  parentWindow.on('leave-full-screen', () => {
    if (goalsWindow && !goalsWindow.isDestroyed()) {
      const [parentX, parentY] = parentWindow.getPosition()
      const [parentWidth] = parentWindow.getSize()
      goalsWindow.setPosition(parentX + parentWidth / 2 - 200, parentY + 100)
    }
  })

  // Keep window visible when parent is minimized
  parentWindow.on('minimize', () => {
    if (goalsWindow?.isVisible()) {
      goalsWindow.setAlwaysOnTop(true)
    }
  })

  // Handle window closure independently
  goalsWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      goalsWindow?.hide()
    }
  })

  goalsWindow.on('closed', () => {
    goalsWindow = null
  })

  ipcMain.on('toggle-goals-window-size', (_, isLarge) => {
    if (goalsWindow) {
      if (isLarge) {
        goalsWindow.setSize(400, 300)
      } else {
        goalsWindow.setSize(400, 48)
      }
    }
  })
}

function createWindow(): void {
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

  // Create tray after window is created
  createTray(mainWindow)

  ipcMain.on('toggle-goals-window-size', (_, isLarge) => {
    if (goalsWindow) {
      if (isLarge) {
        goalsWindow.setSize(400, 300)
      } else {
        goalsWindow.setSize(400, 48)
      }
    }
  })

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

  // Add IPC handlers for window communication
  ipcMain.on('show-goals-window', () => {
    goalsWindow?.show()
  })

  ipcMain.on('hide-goals-window', () => {
    goalsWindow?.hide()
  })

  // Add handler for goals data
  ipcMain.on('update-goals', (event, goalsData) => {
    // Forward goals data to main window
    mainWindow.webContents.send('goals-updated', goalsData)
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
