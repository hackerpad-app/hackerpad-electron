import Editor from './common/Editor'
import RightSlidePanel from './common/RightSlidePanel'

interface DaybookProps {
  pad: string
  setPad: React.Dispatch<React.SetStateAction<string | null>>
}

export default function Daybook({ pad, setPad }: DaybookProps) {
  return (
    <div className="flex h-screen relative">
      <div className="flex w-full overflow-y-auto custom-scrollbar bg-dark-green h-full">
        <Editor />
      </div>
      <RightSlidePanel>
        {/* Add any content you want in the slide panel */}
      </RightSlidePanel>
    </div>
  )
}
