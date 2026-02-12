import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Task } from "@/types";
import { SYSTEM_INSTRUCTION } from "@/config/systemInstruction";

export const geminiService = {
    async generateInsight(apiKey: string, tasks: Task[], habits: any[], userName: string): Promise<string> {
        if (!apiKey) {
            throw new Error("API Key is required");
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

            // Prepare context
            const totalTasks = tasks.length;
            const pendingTasks = tasks.filter(t => t.status !== 'completed');
            const completedTasks = tasks.filter(t => t.status === 'completed');

            const criticalTasks = pendingTasks.filter(t => t.priority === true).map(t => t.title).join(", ");
            const recentWin = completedTasks.length > 0 ? completedTasks[0].title : "nothing yet";

            // Habit Context
            const activeHabits = habits.filter(h => h.streak > 0);
            const topStreak = activeHabits.length > 0 ? Math.max(...activeHabits.map((h: any) => h.streak)) : 0;
            const habitsCompletedToday = habits.filter(h => h.completedToday).length;
            const totalHabits = habits.length;

            const prompt = `
                Act as a motivational AI assistant for ${userName}.
                
                Task Context:
                - User has ${totalTasks} total tasks.
                - ${pendingTasks.length} pending tasks.
                - High priority: ${criticalTasks || "None"}.
                - Recently completed: ${recentWin}.

                Habit Context:
                - Longest current streak: ${topStreak} days.
                - Completed today: ${habitsCompletedToday} / ${totalHabits}.

                Goal: Generate a SHORT, punchy, 1-2 sentence motivational insight.
                 Focus on EITHER their tasks OR their habits, whichever needs more attention or deserves praise.
                Tone: Professional, slightly witty, but encouraging.
                Don't use hashtags.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return text;
        } catch (error) {
            console.error("Gemini API Error:", error);
            throw new Error("Failed to generate insight");
        }
    },

    async verifyKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
        if (!apiKey) return { valid: false, error: "API Key is missing" };
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            // Try flash first, then pro if fails? No, let's stick to what we use.
            const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            const text = response.text();

            if (text) {
                return { valid: true };
            } else {
                return { valid: false, error: "No response text received" };
            }
        } catch (error: any) {
            console.error("Gemini Verification Error:", error);
            // Extract meaningful error message
            const msg = error?.message || error?.toString() || "Unknown error";
            if (msg.includes("API key not valid")) return { valid: false, error: "Invalid API Key" };
            if (msg.includes("404")) return { valid: false, error: "Model not found (Check region/access)" };
            return { valid: false, error: msg };
        }
    },

    async chat(apiKey: string, history: { role: string; parts: string }[], message: string, context: { tasks: Task[], habits: any[], userName: string }): Promise<string> {
        if (!apiKey) throw new Error("API Key is required");

        try {
            const genAI = new GoogleGenerativeAI(apiKey);

            // Format Context as JSON
            const { tasks, habits, userName } = context;
            const contextData = {
                user: { name: userName },
                tasks: tasks.map(t => ({
                    id: t.id,
                    title: t.title,
                    status: t.status,
                    priority: t.priority,
                    deadline: t.dueDate, // Explicitly named "deadline" as requested
                    category: t.category
                })),
                habits: habits.map(h => ({
                    id: h.id,
                    title: h.title,
                    streak: h.streak,
                    completedToday: h.completedToday,
                    target: h.target
                }))
            };

            const jsonContext = JSON.stringify(contextData, null, 2);
            // console.log("Gemini JSON Context Length:", jsonContext.length);

            // Combine static instructions with dynamic data
            const fullSystemInstruction = `
${SYSTEM_INSTRUCTION}

---
### **CURRENT USER DATA (JSON)**
\`\`\`json
${jsonContext}
\`\`\`
            `;

            const model = genAI.getGenerativeModel({
                model: "gemini-3-flash-preview",
                systemInstruction: fullSystemInstruction
            });

            const chat = model.startChat({
                history: history.map(h => ({
                    role: h.role === 'ai' ? 'model' : 'user',
                    parts: [{ text: h.parts }]
                }))
            });

            const result = await chat.sendMessage(message);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Gemini Chat Error:", error);
            throw new Error("Failed to send message");
        }
    }
};
