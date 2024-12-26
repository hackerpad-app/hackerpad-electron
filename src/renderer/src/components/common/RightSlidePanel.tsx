import { useState, useEffect } from 'react'

interface RightSlidePanelProps {
  children?: React.ReactNode
}

const RightSlidePanel: React.FC<RightSlidePanelProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      const threshold = 20 // pixels from the right edge
      const isNearRightEdge = window.innerWidth - e.clientX <= threshold
      setIsVisible(isNearRightEdge)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div
      className={`fixed right-0 top-0 h-full w-64 bg-dark-green/90 shadow-lg transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-4 text-bright-green">
        {children || (
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            {/* Add your panel content here */}
          </div>
        )}
      </div>
    </div>
  )
}

export default RightSlidePanel