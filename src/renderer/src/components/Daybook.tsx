import Sidebar from './common/Sidebar'
import Editor from './common/Editor'

interface DaybookProps {
  pad: string
  setPad: React.Dispatch<React.SetStateAction<string | null>>
}

export default function Daybook({ pad, setPad }: DaybookProps) {
  return (
    <div className="flex h-screen ">
      <div className="flex w-1/5 overflow-hidden h-full">
        <Sidebar pad={pad} setPad={setPad} />
      </div>
      <div className="flex w-4/5 overflow-y-auto custom-scrollbar bg-dark-green h-full">
        <Editor pad={pad} />
      </div>
    </div>
  )
}
