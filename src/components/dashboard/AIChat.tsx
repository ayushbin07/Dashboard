import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, Sparkles, Loader2 } from 'lucide-react';
import { geminiService } from '@/services/geminiService';
import { dbService } from '@/services/dbService';
import type { Task, Habit } from '@/types';
import { motion } from 'framer-motion';

interface AIChatProps {
    apiKey: string;
    tasks: Task[];
    habits: Habit[];
    className?: string;
    onRefresh: () => Promise<void>;
    userAvatar?: string;
}

interface Message {
    id: string;
    role: 'user' | 'ai';
    text: string;
    timestamp: Date;
}

interface AIAction {
    action: 'create_task' | 'update_task' | 'delete_task' | 'toggle_task' | 'create_habit' | 'update_habit' | 'delete_habit' | 'toggle_habit';
    data: any;
    message: string;
}

export function AIChat({ apiKey, tasks, habits, className, onRefresh, userAvatar }: AIChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'ai',
            text: "Hi! I'm your dashboard assistant. I can help you manage your tasks and habits. What's on your mind?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const executeAction = async (actionData: AIAction) => {
        try {
            console.log("Executing Action:", actionData.action, actionData.data);
            switch (actionData.action) {
                case 'create_task':
                    await dbService.addTask(actionData.data);
                    break;
                case 'delete_task':
                    await dbService.deleteTask(actionData.data.id);
                    break;
                case 'update_task':
                    await dbService.updateTask(actionData.data);
                    break;
                case 'toggle_task':
                    // If toggle logic is complex, just assume toggle or set specific status
                    // Here we assume simple toggle if currentStatus provided, or we can fetch current status
                    // Actually, dbService.toggleTask takes (id, currentStatus)
                    await dbService.toggleTask(actionData.data.id, actionData.data.currentStatus || 'pending');
                    break;

                case 'create_habit':
                    // createHabit(title, category, priority, target, color)
                    await dbService.addHabit(
                        actionData.data.title,
                        actionData.data.category || 'General',
                        actionData.data.priority || false,
                        actionData.data.targetPerMonth || 30,
                        actionData.data.color || '#4ade80'
                    );
                    break;
                case 'delete_habit':
                    await dbService.deleteHabit(actionData.data.id);
                    break;
                case 'update_habit':
                    await dbService.updateHabit(actionData.data);
                    break;
                case 'toggle_habit':
                    // toggleHabit(id, date, currentCompleted)
                    // If date missing, assume today
                    const date = actionData.data.date || new Date().toISOString().split('T')[0];
                    await dbService.toggleHabit(actionData.data.id, date, actionData.data.currentCompleted || false);
                    break;
                default:
                    console.warn("Unknown action:", actionData.action);
                    return false;
            }
            await onRefresh(); // Refresh dashboard data after action
            return true;
        } catch (error) {
            console.error("Action Execution Failed:", error);
            return false;
        }
    };

    const handleSend = async () => {
        if (!input.trim() || !apiKey || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const profile = await dbService.getProfile();
            const userName = profile?.username || 'User';

            // Convert current messages to history format for API
            // Exclude the very first welcome message if it's static, or keep it if you want context
            const history = messages.slice(1).map(m => ({
                role: m.role,
                parts: m.text
            }));

            const responseText = await geminiService.chat(
                apiKey,
                history,
                userMessage.text,
                { tasks, habits, userName }
            );

            // Attempt to parse JSON action
            let responseMessageText = responseText;
            try {
                // Heuristic: check if response looks like JSON or contains JSON block
                // Let's assume strict JSON output if action required as per prompt
                // If the response starts with '{' or '```json', try to extract JSON
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const jsonStr = jsonMatch[0];
                    const actionData = JSON.parse(jsonStr) as AIAction;

                    if (actionData.action && actionData.data) {
                        const success = await executeAction(actionData);
                        if (success) {
                            responseMessageText = actionData.message || "Action completed successfully.";
                        } else {
                            responseMessageText = "I tried to perform that action, but something went wrong.";
                        }
                    } else {
                        // Fallback if not an action structure
                        // might be just normal JSON or malformed
                    }
                }
            } catch (e) {
                // Not valid JSON, treat as plain text
                console.log("Response is not JSON action, treating as text.");
            }

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                text: responseMessageText, // Display the message part or the plain text
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                text: "Sorry, I encountered an error connecting to Gemini. Please try again.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!apiKey) return null;

    return (
        <Card className={`flex flex-col h-full rounded-[2rem] border-none shadow-soft bg-white/40 dark:bg-[#1f2937]/40 backdrop-blur-[50px] overflow-hidden ${className}`}>
            {/* Header */}
            <div className="p-4 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#0F5132]/10 dark:bg-[#4ade80]/10">
                    <Sparkles size={16} className="text-[#0F5132] dark:text-[#4ade80]" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                    Vimars AI
                </h3>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((message) => (
                    <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-start gap-2.5 ${message.role === 'user' ? 'flex-row-reverse' : ''
                            }`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${message.role === 'user'
                            ? 'bg-[#E8F5E9] border border-white dark:border-gray-700 shadow-sm'
                            : 'bg-[#0F5132] dark:bg-[#4ade80]'
                            }`}>
                            {message.role === 'user' ? (
                                <span className="text-sm">{userAvatar || '👨‍💻'}</span>
                            ) : (
                                <Bot size={14} className="text-white dark:text-black" />
                            )}
                        </div>

                        <div className={`p-3 rounded-2xl text-sm max-w-[80%] leading-relaxed ${message.role === 'user'
                            ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tr-none shadow-sm'
                            : 'bg-white/60 dark:bg-gray-800/60 text-gray-800 dark:text-gray-100 rounded-tl-none shadow-sm backdrop-blur-sm'
                            }`}>
                            {message.text}
                        </div>
                    </motion.div>
                ))}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-start gap-2.5"
                    >
                        <div className="w-8 h-8 rounded-full bg-[#0F5132] dark:bg-[#4ade80] flex items-center justify-center flex-shrink-0">
                            <Bot size={14} className="text-white dark:text-black" />
                        </div>
                        <div className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3">
                <div className="flex gap-2 relative">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about your tasks..."
                        className="pr-10 bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus-visible:ring-[#0F5132] dark:focus-visible:ring-[#4ade80] rounded-xl"
                        disabled={isLoading}
                    />
                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-1 top-1 h-8 w-8 rounded-lg bg-[#0F5132] hover:bg-[#0a3622] dark:bg-[#4ade80] dark:hover:bg-[#32b665] text-white dark:text-black transition-colors"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </Button>
                </div>
            </div>
        </Card>
    );
}
