import { useEffect } from 'react'
import { useTimer } from '../context/TimeContext'

const TrayStatusManager: React.FC = () => {
  const { isBreak, sessionClockTicking } = useTimer()

  useEffect(() => {
    const status = sessionClockTicking ? (isBreak ? 'Break' : 'Work') : ''
    console.log('Sending status:', status)
    window.electron.ipcRenderer.send('update-tray-text', status)
  }, [sessionClockTicking, isBreak])

  return null
}

export default TrayStatusManager
