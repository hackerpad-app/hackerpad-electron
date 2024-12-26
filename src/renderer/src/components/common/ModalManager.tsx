import StartSessionModal from './modals/StartSessionModal'
import { useSession } from '../context/SessionContext'

export default function ModalManager(): JSX.Element | null {
  const { showStartSessionModal } = useSession()

  return (
    <>
      {showStartSessionModal && <StartSessionModal />}
      {/* Add other modals here */}
    </>
  )
}
