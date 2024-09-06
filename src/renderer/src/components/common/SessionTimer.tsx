import React, { useEffect, useRef, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { VscDebugStart, VscDebugStop } from 'react-icons/vsc'
import { GrPowerReset } from 'react-icons/gr'

import { useTimer } from '../context/TimeContext'

export const config = {
  session_time: 1,
  break_time: 1
}

interface SessionTimerProps {
  onRequestStart: () => void
  onRequestStop: () => void
  onRequestContinue: () => void
  onRequestReset: () => void
}

const SessionTimer: React.FC<SessionTimerProps> = ({
  onRequestStart,
  onRequestStop,
  onRequestContinue,
  onRequestReset
}) => {
  const {
    time,
    setTime,
    sessionActive,
    setSessionActive,
    sessionInProgress,
    setSessionInProgress,
    tasks
  } = useTimer()
  const intervalRef = useRef<number | null>(null)

  const updateTrayTime = useCallback((minutes: number, seconds: number) => {
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`
    invoke('update_tray_time_command', { time: timeString }).catch((error) =>
      console.error('Failed to update time in tray:', error)
    )
  }, [])

  const startTimer = useCallback(() => {
    console.log('startTimer; ', sessionInProgress)
    if (sessionInProgress) {
      console.log('1st condition; continue already started session')
      onRequestContinue()
    } else {
      console.log('2nd condition; start a brand new session')
      onRequestStart()
    }
    setSessionInProgress(true)
  }, [sessionActive, onRequestStart])

  const stopTimer = useCallback(() => {
    console.log('stopTimer')
    console.log('sessionActive', sessionActive)
    console.log('sessionInProgress', sessionInProgress)

    if (sessionActive) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      onRequestStop()
      setSessionActive(false)
    }
  }, [sessionActive, onRequestStop, setSessionActive])

  const resetTimer = useCallback(() => {
    console.log('resetTimer')
    console.log('sessionActive', sessionActive)
    console.log('sessionInProgress', sessionInProgress)

    if (sessionActive || sessionInProgress) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      onRequestReset()
      setSessionActive(false)
      setSessionInProgress(false)
    }
  }, [sessionActive, onRequestReset, setSessionActive, setSessionInProgress])

  useEffect(() => {
    if (!sessionActive) return

    const tick = () => {
      setTime((prevTime) => {
        if (prevTime.seconds === 0) {
          if (prevTime.minutes === 0) {
            const audio = new Audio('/completed.mp3')
            audio.play().catch(console.error)
            const newTime = { minutes: config.session_time, seconds: 0 }
            updateTrayTime(newTime.minutes, newTime.seconds)
            return newTime
          } else {
            const newTime = { minutes: prevTime.minutes - 1, seconds: 59 }
            updateTrayTime(newTime.minutes, newTime.seconds)
            return newTime
          }
        } else {
          const newTime = { ...prevTime, seconds: prevTime.seconds - 1 }
          updateTrayTime(newTime.minutes, newTime.seconds)
          return newTime
        }
      })
    }

    intervalRef.current = window.setInterval(tick, 1000)

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [sessionActive, updateTrayTime, setTime])

  const timerMinutes = time.minutes.toString().padStart(2, '0')
  const timerSeconds = time.seconds.toString().padStart(2, '0')

  return (
    <>
      <div
        style={{
          borderColor: 'rgba(28, 248, 110, 1.0)',
          borderWidth: '2px',
          borderStyle: 'solid',
          zIndex: 0
        }}
        className="p-5 mt-5 space-x-5 flex flex-row items-center justify-center rounded-md"
      >
        <div className="flex justify-center space-x-3 p-59">
          <VscDebugStart
            className="hover:text-bright-green cursor-pointer"
            onClick={startTimer}
            style={{ fontSize: '24px' }}
          />
          <VscDebugStop
            className="hover:text-bright-green cursor-pointer"
            onClick={stopTimer}
            style={{ fontSize: '24px' }}
          />
          <GrPowerReset
            className="hover:text-bright-green cursor-pointer"
            onClick={resetTimer}
            style={{ fontSize: '24px' }}
          />
        </div>
        <div className="flex items-center justify-center text-4xl text-center h-full">
          <p>
            {timerMinutes}:{timerSeconds}
          </p>
        </div>
      </div>

      {sessionInProgress && tasks.length > 0 && (
        <div
          style={{
            position: 'fixed',
            top: '300px',
            right: '10px',
            width: '200px',
            maxHeight: '300px',
            overflowY: 'auto',
            backgroundColor: 'blue',
            border: '1px solid #ccc',
            borderRadius: '5px',
            padding: '10px',
            zIndex: 1000
          }}
        >
          <h3 className="font-bold mb-2">Session Goals:</h3>
          <ul className="list-disc pl-5">
            {tasks.map((task, index) => (
              <li key={index}>{task}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

export default SessionTimer
