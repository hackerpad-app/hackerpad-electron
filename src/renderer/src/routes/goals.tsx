import MovableGoalsWindow from '../components/common/MovableGoalsWindow'
import { TimerProvider } from '../components/context/TimeContext'
import { NotesProvider } from '../components/context/NotesContext'
import { SessionGoalsProvider } from '../components/context/SessionGoalsContext'

export default function GoalsRoute(): JSX.Element {
  return (
    <TimerProvider>
      <NotesProvider pad="daybook">
        <SessionGoalsProvider>
          <MovableGoalsWindow />
        </SessionGoalsProvider>
      </NotesProvider>
    </TimerProvider>
  )
}
