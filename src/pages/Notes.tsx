import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, FileText, Menu } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { dbService } from '@/services/dbService'
import type { Note } from '@/types'

export default function Notes() {
    const [notes, setNotes] = useState<Note[]>([])
    const [selectedNote, setSelectedNote] = useState<Note | null>(null)
    const [content, setContent] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isMobileListVisible, setIsMobileListVisible] = useState(true)

    // Load notes on mount
    useEffect(() => {
        fetchNotes()
    }, [])

    const fetchNotes = async () => {
        setIsLoading(true)
        try {
            const fetchedNotes = await dbService.getNotes()
            setNotes(fetchedNotes)
        } catch (error) {
            console.error('Failed to fetch notes', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateNote = async () => {
        try {
            const newNote = await dbService.addNote('')
            if (newNote) {
                setNotes([newNote, ...notes])
                setSelectedNote(newNote)
                setContent('')
                setIsMobileListVisible(false) // Automatically switch to editor on mobile
            }
        } catch (error) {
            console.error('Failed to create note', error)
        }
    }

    const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('Are you sure you want to delete this note?')) return

        try {
            await dbService.deleteNote(id)
            setNotes(notes.filter(n => n.id !== id))
            if (selectedNote?.id === id) {
                setSelectedNote(null)
                setContent('')
                setIsMobileListVisible(true) // Go back to list if deleted current note
            }
        } catch (error) {
            console.error('Failed to delete note', error)
        }
    }

    const handleSelectNote = (note: Note) => {
        setSelectedNote(note)
        setContent(note.content || '')
        setIsMobileListVisible(false) // Switch to editor on mobile
    }

    const handleSave = async () => {
        if (!selectedNote) return

        setIsSaving(true)
        try {
            await dbService.updateNote(selectedNote.id, content)

            // Update local state
            const updatedNotes = notes.map(n =>
                n.id === selectedNote.id
                    ? { ...n, content, updatedAt: new Date().toISOString() }
                    : n
            )
            setNotes(updatedNotes)
            // Update selected note reference so we don't lose sync
            setSelectedNote({ ...selectedNote, content, updatedAt: new Date().toISOString() })
        } catch (error) {
            console.error('Failed to save note', error)
        } finally {
            setIsSaving(false)
        }
    }

    // Helper to extract a display title from content
    const getDisplayTitle = (noteContent: string) => {
        if (!noteContent || !noteContent.trim()) return 'Empty Note'
        // Get first line or first 30 chars
        const firstLine = noteContent.split('\n')[0].trim()
        return firstLine.length > 30 ? firstLine.substring(0, 30) + '...' : firstLine
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-[90%] mx-auto space-y-6"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    {/* Mobile Toggle Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setIsMobileListVisible(!isMobileListVisible)}
                    >
                        {isMobileListVisible ? (
                            <FileText className="h-6 w-6" /> // Show Editor Icon
                        ) : (
                            <Menu className="h-6 w-6" /> // Menu/List Icon
                        )}
                    </Button>

                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0F5132] to-[#4ade80] bg-clip-text text-transparent">
                            Raw Notes
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">Simple text notes</p>
                    </div>
                </div>
                <Button
                    onClick={handleCreateNote}
                    className="bg-[#0F5132] hover:bg-[#0F5132]/90 text-white rounded-full"
                >
                    <Plus size={20} className="mr-2" />
                    New
                </Button>
            </div>

            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
                {/* Sidebar List */}
                <div className={`col-span-12 md:col-span-4 lg:col-span-3 h-full ${isMobileListVisible ? 'block' : 'hidden'
                    } md:block`}>
                    <Card className="h-full rounded-[2rem] border-none shadow-soft bg-white dark:bg-[#1f2937] overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400">
                                SAVED ({notes.length})
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {isLoading ? (
                                <p className="text-center text-gray-400 py-4">Connecting to NASA satellites...</p>
                            ) : notes.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                                    No notes.<br />Click New to start.
                                </div>
                            ) : (
                                notes.map(note => (
                                    <div
                                        key={note.id}
                                        onClick={() => handleSelectNote(note)}
                                        className={`group p-3 rounded-xl cursor-pointer transition-all border ${selectedNote?.id === note.id
                                            ? 'bg-[#0F5132]/10 border-[#0F5132] dark:border-[#0F5132]'
                                            : 'bg-gray-50 dark:bg-gray-800 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0 pr-2">
                                                <div className={`font-semibold text-sm truncate ${selectedNote?.id === note.id ? 'text-[#0F5132] dark:text-[#4ade80]' : 'text-gray-900 dark:text-white'}`}>
                                                    {getDisplayTitle(note.content)}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {new Date(note.updatedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => handleDeleteNote(note.id, e)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-md transition-opacity"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* Editor Area */}
                <div className={`col-span-12 md:col-span-8 lg:col-span-9 h-full ${!isMobileListVisible ? 'block' : 'hidden'
                    } md:block`}>
                    <Card className="h-full p-6 rounded-[2rem] border-none shadow-soft bg-white dark:bg-[#1f2937] flex flex-col">
                        {selectedNote ? (
                            <>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm text-gray-400">
                                        Last saved: {new Date(selectedNote.updatedAt).toLocaleString()}
                                    </span>
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="bg-[#0F5132] hover:bg-[#0F5132]/90 text-white rounded-full px-6"
                                    >
                                        <Save size={18} className="mr-2" />
                                        {isSaving ? 'Saving...' : 'Save Work'}
                                    </Button>
                                </div>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Start typing your note here..."
                                    className="flex-1 w-full resize-none bg-transparent border-0 focus:ring-0 p-0 text-gray-800 dark:text-gray-200 leading-relaxed text-lg font-mono placeholder-gray-300 dark:placeholder-gray-600 outline-none"
                                    spellCheck={false}
                                />
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                                <FileText size={64} className="mb-4 opacity-20" />
                                <p className="text-lg">Select a note to view or edit</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </motion.div>
    )
}
