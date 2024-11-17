import { useEffect } from 'react'
import { useTimer } from '../context/TimeContext'

const TrayStatusManager: React.FC = () => {
  const { isBreak, sessionClockTicking } = useTimer()

  useEffect(() => {
    const status = sessionClockTicking ? (isBreak ? 'Break' : 'Work') : ''
    window.electron.ipcRenderer.send('update-tray-text', status)
  }, [sessionClockTicking, isBreak])

  return null
}

export default TrayStatusManager
