import Daybook from './components/Daybook'
import Issues from './components/Issues'

import { TimerProvider } from './components/context/TimeContext'

import { useState } from 'react'

export default function App(): JSX.Element | null {
  const [pad, setPad] = useState<string | null>('daybook')

  if (pad == 'daybook') {
    return (
      <TimerProvider>
        <Daybook pad={pad} setPad={setPad} />
      </TimerProvider>
    )
  }
  if (pad == 'issues') {
    return (
      <TimerProvider>
        <Issues pad={pad} setPad={setPad} />
      </TimerProvider>
    )
  }
  return null
}
