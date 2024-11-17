import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

console.log('Preload script is loading...')

// Custom APIs for renderer
const api = {
  updateTrayTimer: (time: string): void => {
    ipcRenderer.send('update-tray-timer', time)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    console.log('Setting up contextBridge...')
    contextBridge.exposeInMainWorld('electron', {
      ipcRenderer: {
        // Used by renderer to send messages TO the main process
        send: (channel: string, data: any) => {
          const validChannels = [
            'update-tray-timer',
            'update-tray-text',
            'show-goals-window',
            'hide-goals-window',
            'change-goals-window-size',
            'request-goals-state',
            'update-goals-state',
            'ping',
            'toggle',
            'timer-update',
            'request-timer-state',
            'timer-state-update'
          ]
          if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data)
          } else {
            console.warn('Invalid channel in preload:', channel)
          }
        },
        // Used by renderer to LISTEN FOR messages FROM the main process
        on: (channel: string, func: (...args: any[]) => void) => {
          const validChannels = [
            'update-tray-timer',
            'update-tray-text',
            'show-goals-window',
            'hide-goals-window',
            'change-goals-window-size',
            'request-goals-state',
            'goals-state-update',
            'ping',
            'timer-update',
            'toggle',
            'request-timer-state',
            'timer-state-update'
          ]
          if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (_, ...args) => func(...args))
          }
        },
        removeListener: (channel: string, func: (...args: any[]) => void) => {
          ipcRenderer.removeListener(channel, func)
        }
      }
    })
    console.log('ContextBridge setup complete')
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('Error in preload setup:', error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
