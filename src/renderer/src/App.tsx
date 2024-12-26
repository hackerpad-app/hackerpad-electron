import Daybook from './components/Daybook'
import TrayStatusManager from './components/common/TrayStatusManager'

import { TimerProvider } from './components/context/TimeContext'
import { NotesProvider } from './components/context/NotesContext'
import { SessionGoalsProvider } from './components/context/SessionGoalsContext'
import { SessionProvider } from './components/context/SessionContext'

export default function App(): JSX.Element | null {
  return (
    <NotesProvider>
      <SessionProvider>
        <TimerProvider>
          <TrayStatusManager />
          <SessionGoalsProvider>
            <Daybook />
          </SessionGoalsProvider>
        </TimerProvider>
      </SessionProvider>
    </NotesProvider>
  )
}
