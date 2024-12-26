import Editor from './common/Editor'
import RightSlidePanel from './common/RightSlidePanel'
import ModalManager from './common/ModalManager'

export default function Daybook(): JSX.Element | null {
  return (
    <div className="flex h-screen relative">
      <div className="flex w-full overflow-y-auto custom-scrollbar bg-dark-green h-full">
        <Editor />
      </div>
      <RightSlidePanel>
      </RightSlidePanel>
      <ModalManager />
    </div>
  )
}
