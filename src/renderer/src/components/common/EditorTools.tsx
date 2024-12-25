import React, { useState } from 'react'

import { GiPlasticDuck } from 'react-icons/gi'
import { CiSquarePlus, CiViewList, CiPlay1, CiStop1, CiUndo } from 'react-icons/ci'

interface ToolsProps {
  // TODO: Implement props
}

const Tools = (ToolsProps): React.ReactNode => {

  const [isHovering, setIsHovering] = useState(false)
  const [isControlsHovering, setIsControlsHovering] = useState(false)

  const handleDuck = (): void => {
    // TODO: Implement duck
  }

  const handleAddNote = (): void => {
    // TODO: Implement add note
  }

  const handleOpenListView = (): void => {
    // TODO: Implement open list view
  }

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="flex justify-between titlebar"
    >
      <div className="flex justify-between w-full titlebar">
        <div className="w-[90px]"></div> 
        <div className="flex-1 text-center text-white opacity-50 font-bold pt-1">
          <span className={`transition-opacity duration-300 ease-in-out ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
            Some Title
          </span>
        </div>
        <div className="flex flex-row items-center">
          <div 
            className="border-border flex items-center"
            onMouseEnter={() => setIsControlsHovering(true)}
            onMouseLeave={() => setIsControlsHovering(false)}
          >
            <button className="mr-2 bg-transparent non-draggable">
              <div className={`py-2 text-bright-green/85 text-base transition-opacity duration-300 ease-in-out ${isControlsHovering ? 'opacity-100' : 'opacity-0'}`}>
                <CiPlay1 />
              </div>
            </button>
            <button className="mr-2 bg-transparent non-draggable">
              <div className={`py-2 text-bright-green/85 text-base transition-opacity duration-300 ease-in-out ${isControlsHovering ? 'opacity-100' : 'opacity-0'}`}>
                <CiStop1 />
              </div>
            </button>
            <button className="mr-1 bg-transparent non-draggable">
              <div className={`py-2 text-bright-green/85 text-base transition-opacity duration-300 ease-in-out ${isControlsHovering ? 'opacity-100' : 'opacity-0'}`}>
                <CiUndo />
              </div>
            </button>
          </div>
          <div className={`h-6 w-px mr-1 bg-bright-green transition-opacity duration-300 ease-in-out ${isControlsHovering ? 'opacity-50' : 'opacity-0'}`}></div>
          <div className="flex flex-row items-center">
            <button onClick={handleDuck} className="mr-2 bg-transparent non-draggable">
              <div className={`py-2 text-bright-green/85 text-base transition-opacity duration-300 ease-in-out ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
                <GiPlasticDuck />
              </div>
            </button>
            <button onClick={handleOpenListView} className="mr-2 bg-transparent non-draggable">
              <div className={`py-2 text-bright-green/85 text-base transition-opacity duration-300 ease-in-out ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
                <CiViewList />
              </div>
            </button>
            <button
              onClick={handleAddNote}
              className="bg-transparent text-bright-green/85"
              title="Mark daybook as finished"
            >
              <div className={`flex items-center text-base transition-opacity duration-300 ease-in-out ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
                <CiSquarePlus />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tools
