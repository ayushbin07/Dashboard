import { useState, useEffect } from 'react'
import { FileText, Plus, Trash2, Edit2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'

interface Note {
    id: string
    title: string
    content: string
    createdAt: string
    updatedAt: string
}

export default function Notes() {
    const [notes, setNotes] = useState<Note[]>([])
    const [selectedNote, setSelectedNote] = useState<Note | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState('')
    const [editContent, setEditContent] = useState('')
    const [isPreview, setIsPreview] = useState(false)

    useEffect(() => {
        const savedNotes = localStorage.getItem('notes')
        if (savedNotes) {
            const parsed = JSON.parse(savedNotes)
            setNotes(parsed)
            if (parsed.length > 0) {
                setSelectedNote(parsed[0])
            }
        }
    }, [])

    const saveNotes = (updatedNotes: Note[]) => {
        setNotes(updatedNotes)
        localStorage.setItem('notes', JSON.stringify(updatedNotes))
    }

    const createNewNote = () => {
        const newNote: Note = {
            id: Date.now().toString(),
            title: 'Untitled Note',
            content: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
        const updatedNotes = [newNote, ...notes]
        saveNotes(updatedNotes)
        setSelectedNote(newNote)
        setEditTitle(newNote.title)
        setEditContent(newNote.content)
        setIsEditing(true)
    }

    const deleteNote = (noteId: string) => {
        const updatedNotes = notes.filter(n => n.id !== noteId)
        saveNotes(updatedNotes)
        if (selectedNote?.id === noteId) {
            setSelectedNote(updatedNotes[0] || null)
            setIsEditing(false)
        }
    }

    const startEditing = () => {
        if (selectedNote) {
            setEditTitle(selectedNote.title)
            setEditContent(selectedNote.content)
            setIsEditing(true)
        }
    }

    const saveEdit = () => {
        if (selectedNote) {
            const updatedNotes = notes.map(note =>
                note.id === selectedNote.id
                    ? {
                        ...note,
                        title: editTitle,
                        content: editContent,
                        updatedAt: new Date().toISOString()
                    }
                    : note
            )
            saveNotes(updatedNotes)
            setSelectedNote({ ...selectedNote, title: editTitle, content: editContent })
            setIsEditing(false)
        }
    }

    const cancelEdit = () => {
        setIsEditing(false)
        setEditTitle('')
        setEditContent('')
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-[90%] mx-auto space-y-6"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0F5132] to-[#4ade80] bg-clip-text text-transparent">
                        Notes
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">Write and organize your notes</p>
                </div>
                <Button
                    onClick={createNewNote}
                    className="bg-[#0F5132] hover:bg-[#0F5132]/90 text-white rounded-full"
                >
                    <Plus size={20} className="mr-2" />
                    New Note
                </Button>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Sidebar - Notes List */}
                <div className="col-span-12 md:col-span-4 lg:col-span-3">
                    <Card className="p-4 rounded-[2rem] border-none shadow-soft bg-white dark:bg-[#1f2937]">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 px-2">
                            ALL NOTES ({notes.length})
                        </h3>
                        <div className="space-y-2 max-h-[600px] overflow-y-auto">
                            {notes.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                                    No notes yet.<br />Create your first note!
                                </div>
                            ) : (
                                notes.map(note => (
                                    <motion.div
                                        key={note.id}
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => {
                                            setSelectedNote(note)
                                            setIsEditing(false)
                                        }}
                                        className={`p-3 rounded-xl cursor-pointer transition-all ${selectedNote?.id === note.id
                                            ? 'bg-[#0F5132]/10 border-l-4 border-l-[#0F5132]'
                                            : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                                    {note.title}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {new Date(note.updatedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    deleteNote(note.id)
                                                }}
                                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                                            >
                                                <Trash2 size={14} className="text-red-500" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* Editor/Preview Area */}
                <div className="col-span-12 md:col-span-8 lg:col-span-9">
                    <Card className="p-8 rounded-[2rem] border-none shadow-soft bg-white dark:bg-[#1f2937] min-h-[600px]">
                        {selectedNote ? (
                            <>
                                {/* Toolbar */}
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {isEditing ? editTitle : selectedNote.title}
                                    </h3>
                                    <div className="flex gap-2">
                                        {isEditing ? (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setIsPreview(!isPreview)}
                                                    className="rounded-full"
                                                >
                                                    {isPreview ? 'Edit' : 'Preview'}
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={cancelEdit}
                                                    className="rounded-full"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={saveEdit}
                                                    className="bg-[#0F5132] hover:bg-[#0F5132]/90 text-white rounded-full"
                                                >
                                                    Save
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={startEditing}
                                                className="bg-[#0F5132] hover:bg-[#0F5132]/90 text-white rounded-full"
                                            >
                                                <Edit2 size={16} className="mr-2" />
                                                Edit
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                {isEditing ? (
                                    <div className="space-y-4">
                                        {!isPreview ? (
                                            <>
                                                <input
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold"
                                                    placeholder="Note title..."
                                                />
                                                <textarea
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    className="w-full h-[450px] px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none"
                                                    placeholder="Start writing your note..."
                                                />
                                            </>
                                        ) : (
                                            <div className="prose dark:prose-invert max-w-none">
                                                <ReactMarkdown>{editContent}</ReactMarkdown>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="prose dark:prose-invert max-w-none">
                                        <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                <FileText size={64} className="mb-4 opacity-50" />
                                <p className="text-lg">Select a note or create a new one</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </motion.div>
    )
}
