import Sidebar from './common/Sidebar'
import Editor from './common/Editor'

interface NotesProps {
  pad: string
  setPad: React.Dispatch<React.SetStateAction<string | null>>
}

export default function Notes({ pad, setPad }: NotesProps) {
  return (
    <div className="flex flex-row">
      <div className="flex w-1/5 h-full overflow-hidden">
        <Sidebar pad={pad} setPad={setPad} />
      </div>
      <div className="w-4/5 h-full overflow-y-auto bg-dark-green">
        <Editor pad={pad} />
      </div>
    </div>
  )
}
