import { app, shell, BrowserWindow, ipcMain, Tray, Menu, nativeImage, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let mainWindow: BrowserWindow
let goalsWindow: BrowserWindow

let tray: Tray | null = null
let isQuitting = false
let trayText = 'Hi'

let timerState = {
  minutes: 0,
  seconds: 0
}

interface GoalsState {
  distractions: Distraction[]
  goals: Goal[]
  time: { minutes: number; seconds: number }
}

interface Goal {
  id: string
  text: string
  finished: boolean
}

interface Distraction {
  id: string
  text: string
}

const goalsState: GoalsState = {
  distractions: [],
  goals: [],
  time: { minutes: 0, seconds: 0 }
}

ipcMain.on('show-goals-window', () => {
  if (!goalsWindow) {
    createGoalsWindow(mainWindow)
  } else {
    goalsWindow.show()
    goalsWindow.setAlwaysOnTop(true, 'screen-saver', 1)
    goalsWindow.moveTop()
  }
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

  goalsWindow = new BrowserWindow({
    width: 400,
    height: 48,
    frame: false,
    show: false,
    transparent: true,
    resizable: false,
    acceptFirstMouse: true,
    backgroundColor: '#00000000',
    modal: false,
    movable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: true,
    hasShadow: false,
    fullscreenable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: true,
      enablePreferredSizeMode: true
    },
    type: 'panel'
  })

  if (process.platform === 'darwin') {
    goalsWindow.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
      skipTransformProcessType: false
    })
    goalsWindow.setWindowButtonVisibility(false)
  }

  goalsWindow.setAlwaysOnTop(true, 'screen-saver', 2)
  goalsWindow.setWindowButtonVisibility(false)

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    goalsWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/movable-goals.html`)
  } else {
    goalsWindow.loadFile(join(__dirname, '../renderer/movable-goals.html'))
  }

  // Handle the goals window position and visibility
  goalsWindow.once('ready-to-show', () => {
    if (parentWindow && !parentWindow.isDestroyed()) {
      const displays = require('electron').screen.getAllDisplays()
      const primaryDisplay = displays[0]
      const { workArea } = primaryDisplay
      goalsWindow?.setPosition(workArea.x + workArea.width / 2 - 200, workArea.y + 100)
      goalsWindow?.show()
    }
  })

  // Remove or modify the fullscreen event handlers since we want independent positioning
  // You can remove these event listeners entirely if you want full independence
  parentWindow.removeAllListeners('enter-full-screen')
  parentWindow.removeAllListeners('leave-full-screen')

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

  ipcMain.on('change-goals-window-size', (_, isLarge) => {
    if (goalsWindow) {
      if (isLarge) {
        goalsWindow.setSize(400, 300)
      } else {
        goalsWindow.setSize(400, 48)
      }
    }
  })

  // Add focus handling
  ipcMain.on('focus-window', () => {
    if (goalsWindow && !goalsWindow.isDestroyed()) {
      goalsWindow.webContents.focus()
      goalsWindow.moveTop()
    }
  })

  // Remove the existing focus handlers and replace with this:
  goalsWindow.on('blur', () => {
    // Prevent the window from losing focus
    if (goalsWindow && !goalsWindow.isDestroyed()) {
      goalsWindow.webContents.focus()
    }
  })

  // Add this to ensure the window stays focused when shown
  goalsWindow.on('show', () => {
    if (goalsWindow && !goalsWindow.isDestroyed()) {
      goalsWindow.webContents.focus()
    }
  })
}

function createWindow(): void {
  // Get the primary display's width
  const primaryDisplay = screen.getPrimaryDisplay()
  const screenWidth = primaryDisplay.workAreaSize.width
  const windowWidth = screenWidth / 4

  mainWindow = new BrowserWindow({
    width: windowWidth,
    minWidth: windowWidth,
    maxWidth: windowWidth,
    height: 670,
    minHeight: 150,
    show: false,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    fullscreenable: false,
    resizable: true,
    type: 'panel',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // Create tray after window is created
  createTray(mainWindow)

  ipcMain.on('change-goals-window-size', (_, isLarge) => {
    if (goalsWindow) {
      if (isLarge) {
        goalsWindow.setSize(400, 300)
      } else {
        goalsWindow.setSize(400, 48)
      }
    }
  })

  // Deal with the tray
  ipcMain.on('update-tray-timer', (_event, time: string) => {
    if (tray) {
      const displayTime =
        process.platform === 'darwin' ? ` ${trayText} ${time}` : `${trayText} ${time}`
      tray.setTitle(displayTime)
    }
  })

  ipcMain.on('update-tray-text', (_event, text: string) => {
    trayText = text
    // Trigger a refresh of the tray title if needed
    mainWindow.webContents.send('request-timer-update')
  })

  // Deal with IP communcation between the two windows
  ipcMain.on('show-goals-window', () => {
    goalsWindow?.show()
  })

  ipcMain.on('hide-goals-window', () => {
    goalsWindow?.hide()
  })

  ipcMain.on('request-goals-state', (event) => {
    event.reply('goals-state-update', goalsState)
  })

  ipcMain.on('update-goals-state', (event, newState: any) => {
    try {
      switch (newState.type) {
        case 'init-session':
          goalsState.goals = []
          goalsState.distractions = []
          break

        case 'add-goal':
          goalsState.goals = newState.goals
          break

        case 'add-distraction':
          goalsState.distractions = newState.distractions
          break

        case 'change-goal-status':
          goalsState.goals = goalsState.goals.map((goal) =>
            goal.id === newState.goalId ? { ...goal, finished: !goal.finished } : goal
          )
          break

        default:
          console.warn('Unknown state update type:', newState.type)
      }

      // Broadcast updates to all windows
      mainWindow?.webContents.send('goals-state-update', goalsState)
      goalsWindow?.webContents.send('goals-state-update', goalsState)
    } catch (error) {
      console.error('Error processing update-goals-state:', error)
    }
  })

  // Modify window close behavior
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
    return false
  })

  mainWindow.loadFile('index.html')

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // [debugging]; open the dev tools
  mainWindow.webContents.openDevTools()

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

  ipcMain.on('ping', () => {
    console.log('Main process received ping')
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

app.on('before-quit', () => {
  isQuitting = true
})

ipcMain.on('timer-update', (_event, newTime) => {
  timerState = newTime
  // Broadcast to goals window
  goalsWindow?.webContents.send('timer-state-update', timerState)
})

ipcMain.on('request-timer-state', (event) => {
  event.reply('timer-state-update', timerState)
})
