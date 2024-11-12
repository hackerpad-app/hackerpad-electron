import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useSessionGoals, Session } from './../context/SessionGoalsContext'
import { GiDistraction } from 'react-icons/gi'
import { FaInfoCircle } from 'react-icons/fa'

interface CompletedSessionGoalsProps {
  noteId: string
}

const CompletedSessionGoals: React.FC<CompletedSessionGoalsProps> = ({ noteId }) => {
  const { completedSessions } = useSessionGoals()
  const [hoveredItem, setHoveredItem] = useState<Session | 'summary' | null>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })

  const filteredSessions = completedSessions.filter((session) => session.noteId === noteId)

  const totalCompletedGoals = filteredSessions.reduce(
    (total, session) => total + session.goals.filter((goal) => goal.finished).length,
    0
  )
  const totalGoals = filteredSessions.reduce((total, session) => total + session.goals.length, 0)

  const finishRate = totalGoals > 0 ? (totalCompletedGoals / totalGoals) * 100 : 0
  const formattedFinishRate = finishRate.toFixed(1)

  const lastSession = filteredSessions[filteredSessions.length - 1]
  const daySummary = lastSession?.daySummary

  return (
    <>
      <div className="flex flex-wrap gap-2 p-5 items-center">
        {filteredSessions.map((session) => (
          <SessionPin
            key={session.id}
            session={session}
            onHover={(session, x, y) => {
              setHoveredItem(session)
              setHoverPosition({ x, y })
            }}
            onLeave={() => setHoveredItem(null)}
          />
        ))}

        <div className="text-opacity-75 text-sm text-gray-400">
          <span className="ml-2">{formattedFinishRate}% tasks finished </span>
        </div>
        {daySummary && (
          <SummaryPin
            onHover={(x, y) => {
              setHoveredItem('summary')
              setHoverPosition({ x, y })
            }}
            onLeave={() => setHoveredItem(null)}
          />
        )}
      </div>
      {hoveredItem &&
        createPortal(
          hoveredItem === 'summary' ? (
            <SummaryHoverInfo summary={daySummary!} position={hoverPosition} />
          ) : (
            <HoverInfo session={hoveredItem} position={hoverPosition} />
          ),
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

const SummaryPin: React.FC<{
  onHover: (x: number, y: number) => void
  onLeave: () => void
}> = ({ onHover, onLeave }) => {
  const pinRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = (): void => {
    if (pinRef.current) {
      const rect = pinRef.current.getBoundingClientRect()
      onHover(rect.left + 40, rect.bottom + 10)
    }
  }

  return (
    <div
      ref={pinRef}
      className="bg-bright-green text-black text-xs px-4 py-4 rounded-xl cursor-pointer hover:bg-green-400 transition-colors duration-200 flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onLeave}
    >
      <FaInfoCircle className="mr-2" />
      Summary
    </div>
  )
}

const SummaryHoverInfo: React.FC<{ summary: string; position: { x: number; y: number } }> = ({
  summary,
  position
}) => {
  return (
    <div
      className="fixed bg-bright-green text-black p-3 rounded-lg shadow-lg w-64 z-50"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <h4 className="font-semibold mb-2">Summary</h4>
      <p className="text-sm">{summary}</p>
    </div>
  )
}

const HoverInfo: React.FC<{ session: Session; position: { x: number; y: number } }> = ({
  session,
  position
}) => {
  return (
    <div
      className="fixed bg-macdonalds-shit text-black p-3 rounded-lg shadow-lg w-64 z-50"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold">Tasks</h4>
        {session.distractions.length > 0 && (
          <div className="text-xs flex items-center">
            <GiDistraction className="mr-1 text-bright-green" />
            <span>{session.distractions.length} distraction(s)</span>
          </div>
        )}
      </div>
      <ul className="list-none text-sm max-h-40 overflow-y-auto pl-4">
        {session.goals.map((goal) => (
          <li key={goal.id} className="flex items-start mb-1 relative">
            <span className="absolute left-[-1em] top-[0.4em] w-1.5 h-1.5 bg-black rounded-full"></span>
            <span className={`${goal.finished ? 'line-through' : ''} ml-2`}>{goal.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CompletedSessionGoals
