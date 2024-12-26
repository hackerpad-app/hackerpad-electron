import { useEffect } from 'react'
import { useTimer } from '../context/TimeContext'

const TrayStatusManager: React.FC = () => {
  const { time, isBreak, sessionClockTicking } = useTimer()

  useEffect(() => {
    const formattedTime = `${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`
    const status = sessionClockTicking ? (isBreak ? 'Break' : 'Work') : ''
    if (status) {
      window.electron.ipcRenderer.send('update-tray-text', status)
    }
    window.electron.ipcRenderer.send('update-tray-timer', formattedTime)
  }, [time.minutes, time.seconds, sessionClockTicking, isBreak])

  return null
}

export default TrayStatusManager
