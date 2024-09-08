import { useState } from 'react'

import Daybook from './components/Daybook'
import Notes from './components/Notes'
import { TimerProvider } from './components/context/TimeContext'
import { NotesProvider } from './components/context/NotesContext'

export default function App(): JSX.Element | null {
  const [pad, setPad] = useState<string | null>('daybook')

  return (
    <TimerProvider>
      <NotesProvider pad={pad || 'daybook'}>
        {pad === 'daybook' && <Daybook pad={pad} setPad={setPad} />}
        {pad === 'notes' && <Notes pad={pad} setPad={setPad} />}
      </NotesProvider>
    </TimerProvider>
  )
}
