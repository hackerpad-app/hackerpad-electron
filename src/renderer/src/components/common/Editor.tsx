import { useRef, useEffect, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import { useNotesContext } from './../context/NotesContext'
// import { useSessionGoals } from './../context/SessionGoalsContext'
// import { useTimer } from './../context/TimeContext' // Add this import
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Strike from '@tiptap/extension-strike'
// import confetti from 'canvas-confetti'
import Tools from './EditorTools'
import HighlightMenu from './HighlightMenu'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'
// import CompletedSessionGoals from './CompletedSessionGoals'
// import dingSound from '../../assets/ding.mp3'
import { supabase } from '../../lib/supabaseClient' // Add this import

interface EditorProps {
  pad: string
}

export default function Editor({ pad }: EditorProps): React.ReactElement {
  const { displayedNoteDaybook, setDisplayedNoteDaybook } = useNotesContext()

  // const [previousContent, setPreviousContent] = useState('')

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  // const { currentSession, endCurrentSession } = useSessionGoals()
  // const { isBreak } = useTimer()

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (displayedNoteDaybook) {
      setIsLoading(false)
    }
  }, [displayedNoteDaybook])

  useEffect(() => {
    return (): void => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // const headlineEditor = useEditor({
  //   extensions: [StarterKit, Highlight.configure({ multicolor: true }), Typography],
  //   content: '',
  //   editorProps: {
  //     attributes: {
  //       class: 'prose max-w-none h-full w-full'
  //     }
  //   },
  //   onUpdate: () => {
  //     const newHeadline = headlineEditor?.getHTML()
  //     if (newHeadline !== undefined && displayedNote) {
  //       let cleanedHeadline = newHeadline.replace(/<[^>]*>/g, '')
  //       if (cleanedHeadline.length > 45) {
  //         cleanedHeadline = cleanedHeadline.substring(0, 25)
  //         headlineEditor?.commands.setContent(`<h1>${cleanedHeadline}</h1>`)
  //       }

  //       const newNote = { ...displayedNote, headline: cleanedHeadline }
  //       setDisplayedNote(newNote)
  //     }
  //   }
  // })

  // Add autosave functionality
  useEffect(() => {
    const autoSave = async (): Promise<void> => {
      if (!displayedNoteDaybook?.id || !displayedNoteDaybook.content) return

      try {
        const { error } = await supabase
          .from('notes')
          .update({
            content: displayedNoteDaybook.content,
            updated_at: new Date().toISOString()
          })
          .eq('id', displayedNoteDaybook.id)

        if (error) throw error
      } catch (error) {
        console.error('Error auto-saving note:', error)
      }
    }

    // Set up auto-save interval
    const autoSaveInterval = setInterval(autoSave, 1000) // 5 seconds

    // Cleanup interval on unmount
    return (): void => {
      clearInterval(autoSaveInterval)
    }
  }, [displayedNoteDaybook])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        listItem: false
      }),
      BulletList,
      ListItem,
      Highlight.configure({ multicolor: true }),
      Typography,
      Strike,
      TaskItem.configure({
        nested: true
      }),
      TaskList
    ],
    content: displayedNoteDaybook?.content || '',
    editorProps: {
      attributes: {
        class: 'prose max-w-none h-1/2 w-full tiptap task-list-inline'
      }
    },
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML()
      if (newContent !== undefined && displayedNoteDaybook) {
        // Debounce the save operation
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current)
        }

        const newNote = { ...displayedNoteDaybook, content: newContent }
        setDisplayedNoteDaybook(newNote)

        // Check for completed tasks
        // const prevCheckedCount = (previousContent.match(/data-checked="true"/g) || []).length
        // const newCheckedCount = (newContent.match(/data-checked="true"/g) || []).length

        // if (newCheckedCount > prevCheckedCount) {
        //   triggerConfetti()
        // }

        // setPreviousContent(newContent)
      }
    }
  })

  // Add this effect to update editor content when displayedNoteDaybook changes
  useEffect(() => {
    if (editor && displayedNoteDaybook?.content) {
      editor.commands.setContent(displayedNoteDaybook.content)
    }
  }, [editor, displayedNoteDaybook])

  // useEffect(() => {
  //   if (isBreak && currentSession) {
  //     endCurrentSession()
  //   }
  // }, [isBreak, currentSession, endCurrentSession])

  // const triggerConfetti = (): void => {
  //   const audio = new Audio(dingSound)
  //   audio.volume = 0.05
  //   audio.play().catch((error) => console.error('Error playing sound:', error))

  //   confetti({
  //     particleCount: 50,
  //     spread: 75,
  //     origin: { y: 0.65 },
  //     colors: ['#26a69a']
  //   })
  // }

  // useEffect(() => {
  //   if (displayedNote && headlineEditor && editor) {
  //     const wrappedHeadline = `<h1>${displayedNote.headline}</h1>`
  //     if (headlineEditor.getHTML() !== wrappedHeadline) {
  //       headlineEditor.commands.setContent(wrappedHeadline, false, {
  //         preserveWhitespace: true
  //       })
  //     }

  //     if (editor.getHTML() !== displayedNote.content) {
  //       editor.commands.setContent(displayedNote.content, false, {
  //         preserveWhitespace: true
  //       })
  //     }
  //   }
  // }, [headlineEditor, editor, displayedNote])

  return (
    <div className="bg-dark-green relative h-screen w-full pr-5">
      <div className="relative">
        <Tools pad={pad} />
      </div>
      <div className="h-full w-full" style={{ minHeight: '75%', height: 'auto' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {editor && pad === 'daybook' && <HighlightMenu editor={editor} />}
            <EditorContent editor={editor} />
          </>
        )}
      </div>
    </div>
  )
}
