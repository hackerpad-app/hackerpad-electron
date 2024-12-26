import { useState } from 'react'

import Daybook from './components/Daybook'
import Notes from './components/Notes'
import { TimerProvider } from './components/context/TimeContext'
import { NotesProvider } from './components/context/NotesContext'
import { SessionGoalsProvider } from './components/context/SessionGoalsContext'
import TrayStatusManager from './components/common/TrayStatusManager'
import { SessionProvider } from './components/context/SessionContext'

export default function App(): JSX.Element | null {
  const [pad, setPad] = useState<string | null>('daybook')

  return (
    <NotesProvider>
      <SessionProvider>
        <TimerProvider>
          <TrayStatusManager />
          <SessionGoalsProvider>
            {pad === 'daybook' && <Daybook pad={pad} setPad={setPad} />}
            {pad === 'notes' && <Notes pad={pad} setPad={setPad} />}
          </SessionGoalsProvider>
        </TimerProvider>
      </SessionProvider>
    </NotesProvider>
  )
}
