import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { taskService } from '@/services/taskService'
import type { Task } from '@/types'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trash2, Calendar, Tag, CheckCircle } from 'lucide-react'
import { motion } from "framer-motion"

export default function TaskDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [task, setTask] = useState<Task | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) return
        loadTask()
    }, [id])

    const loadTask = async () => {
        try {
            const allTasks = await taskService.getTasks()
            const found = allTasks.find(t => t.id === id)
            if (found) setTask(found)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!id) return
        if (confirm('Are you sure you want to delete this task?')) {
            await taskService.deleteTask(id)
            navigate('/')
        }
    }

    if (loading) return <div>Loading...</div>
    if (!task) return <div>Task not found</div>

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
        >
            <Button variant="ghost" onClick={() => navigate('/')} className="mb-4 pl-0 hover:pl-2 transition-all">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
            </Button>

            <Card className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 ${task.priority ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                            {task.priority ? 'High Priority' : 'Additional'}
                        </span>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{task.title}</h1>
                    </div>
                </div>

                <div className="flex gap-4 border-y border-gray-100 py-4">
                    <div className="flex items-center text-sm text-gray-500">
                        <Tag className="h-4 w-4 mr-2" />
                        {task.category}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {task.status}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Date'}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900">Notes</h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {task.notes || "No notes provided for this task."}
                    </p>
                </div>

                <div className="pt-6 flex justify-end">
                    <Button variant="ghost" onClick={handleDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Task
                    </Button>
                </div>
            </Card>
        </motion.div>
    )
}
