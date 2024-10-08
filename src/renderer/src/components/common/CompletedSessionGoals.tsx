import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useSessionGoals, Session } from './../context/SessionGoalsContext'

const CompletedSessionGoals: React.FC = () => {
  const { completedSessions } = useSessionGoals()
  const [hoveredSession, setHoveredSession] = useState<Session | null>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })

  if (completedSessions.length === 0) {
    return null
  }

  const totalCompletedGoals = completedSessions.reduce(
    (total, session) => total + session.goals.filter((goal) => goal.finished).length,
    0
  )
  const totalGoals = completedSessions.reduce((total, session) => total + session.goals.length, 0)

  const finishRate = totalGoals > 0 ? (totalCompletedGoals / totalGoals) * 100 : 0
  const formattedFinishRate = finishRate.toFixed(1)

  return (
    <>
      <div className="flex flex-wrap gap-2 p-5 items-center">
        {completedSessions.map((session) => (
          <SessionPin
            key={session.id}
            session={session}
            onHover={(session, x, y) => {
              setHoveredSession(session)
              setHoverPosition({ x, y })
            }}
            onLeave={() => setHoveredSession(null)}
          />
        ))}
        <div className="text-opacity-75 text-sm text-white">
          <span className="ml-2">{formattedFinishRate}% tasks finished </span>
        </div>
      </div>
      {hoveredSession &&
        createPortal(
          <HoverInfo session={hoveredSession} position={hoverPosition} />,
          document.body
        )}
    </>
  )
}

const SessionPin: React.FC<{
  session: Session
  onHover: (session: Session, x: number, y: number) => void
  onLeave: () => void
}> = ({ session, onHover, onLeave }) => {
  const pinRef = useRef<HTMLDivElement>(null)
  const startTime = new Date(session.startTime)
  const endTime = session.endTime ? new Date(session.endTime) : new Date()

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleMouseEnter = (): void => {
    if (pinRef.current) {
      const rect = pinRef.current.getBoundingClientRect()
      onHover(session, rect.left + 40, rect.bottom + 10)
    }
  }

  return (
    <div
      ref={pinRef}
      className="bg-macdonalds-shit text-black text-xs px-4 py-4 rounded-xl cursor-pointer hover:bg-macdonalds-shit-bright transition-colors duration-200"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onLeave}
    >
      {formatTime(startTime)}-{formatTime(endTime)}
    </div>
  )
}

const HoverInfo: React.FC<{ session: Session; position: { x: number; y: number } }> = ({
  session,
  position
}) => {
  return (
    <div
      className="fixed bg-macdonalds-shit text-white p-2 rounded shadow-lg w-64 z-50"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <h4 className="font-semibold mb-2">Tasks</h4>
      <ul className="list-none text-sm max-h-40 overflow-y-auto pl-4">
        {session.goals.map((goal) => (
          <li key={goal.id} className="flex items-start mb-1 relative">
            <span className="absolute left-[-1em] top-[0.4em] w-1.5 h-1.5 bg-white rounded-full"></span>
            <span className={`${goal.finished ? 'line-through' : ''} ml-2`}>{goal.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CompletedSessionGoals