import React, { useState, useEffect } from 'react'

const MovableGoalsWindowContent: React.FC = () => {
  const [goals, setGoals] = useState<string[]>([])

  useEffect(() => {
    console.log('MovableGoalsWindowContent mounted')
    const handleGoalsUpdate = (_event: unknown, updatedGoals: string[]): void => {
      console.log('Goals updated:', updatedGoals)
      setGoals(updatedGoals)
    }

    window.electron.ipcRenderer.on('update-goals', handleGoalsUpdate)

    return (): void => {
      window.electron.ipcRenderer.removeListener('update-goals', handleGoalsUpdate)
    }
  }, [])

  const handleClose = () => {
    console.log('Close button clicked')
    window.electron.ipcRenderer.send('close-movable-goals-window')
  }

  return (
    <div className="w-full h-full bg-blue-100 p-4 text-black">
      <h1 className="text-2xl font-bold mb-4">Movable Goals Window</h1>
      <p className="mb-4">This is static content that should always be visible.</p>
      <button 
        onClick={handleClose}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Close Window
      </button>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Goals:</h2>
        {goals.length > 0 ? (
          <ul>
            {goals.map((goal, index) => (
              <li key={index} className="mb-1">{goal}</li>
            ))}
          </ul>
        ) : (
          <p>No goals set for this session.</p>
        )}
      </div>
    </div>
  )
}

export default MovableGoalsWindowContent
