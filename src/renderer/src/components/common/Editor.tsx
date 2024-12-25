import { useRef, useEffect, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import { useNotesContext } from './../context/NotesContext'
import HighlightMenu from './HighlightMenu'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Strike from '@tiptap/extension-strike'
import Tools from './EditorTools'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'
import { supabase } from '../../lib/supabaseClient'

export default function Editor(): React.ReactElement {
  const { displayedNoteDaybook, setDisplayedNoteDaybook } = useNotesContext()
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Wait until the displayedNote is loaded
  useEffect(() => {
    if (displayedNoteDaybook) {
      setIsLoading(false)
    }
  }, [displayedNoteDaybook])

  // Autosave functionality
  useEffect(() => {
    return (): void => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

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

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(autoSave, 1000)

    return (): void => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
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
    autofocus: 'end',
    enableCoreExtensions: true,
    onFocus: ({ editor }) => {
      const pos = editor.state.selection.$anchor.pos
      editor.commands.focus(pos)
    },
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML()
      if (newContent !== undefined && displayedNoteDaybook) {
        const newNote = { ...displayedNoteDaybook, content: newContent }
        setDisplayedNoteDaybook(newNote)
      }
    }
  })

  useEffect(() => {
    if (editor && displayedNoteDaybook?.content) {
      const currentPos = editor.state.selection.$anchor.pos
      if (editor.getHTML() !== displayedNoteDaybook.content) {
        editor.commands.setContent(displayedNoteDaybook.content, false)
        setTimeout(() => {
          editor.commands.setTextSelection(Math.min(currentPos, editor.state.doc.content.size))
        }, 0)
      }
    }
  }, [editor, displayedNoteDaybook])

  return (
    <div className="bg-dark-green relative h-screen w-full pr-5">
      <div className="relative">
        <Tools />
      </div>
      <div className="h-full w-full" style={{ minHeight: '75%', height: 'auto' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {editor && <HighlightMenu editor={editor} />}
            <EditorContent editor={editor} />
          </>
        )}
      </div>
    </div>
  )
}
