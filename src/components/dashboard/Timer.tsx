import { useState, useEffect, useRef } from 'react'
import { Card } from "@/components/ui/card"
import { Play, Pause, Square, Plus, Minus } from "lucide-react"

export function Timer() {
    const [duration, setDuration] = useState(25 * 60) // Default 25 min
    const [timeLeft, setTimeLeft] = useState(25 * 60)
    const [isActive, setIsActive] = useState(false)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // Using AudioContext for sound generation in playAlarm instead of static files

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1)
            }, 1000)
        } else if (timeLeft === 0) {
            setIsActive(false)
            if (timerRef.current) clearInterval(timerRef.current)
            playAlarm()
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [isActive, timeLeft])

    const playAlarm = () => {
        // Create an oscillator for beep since external files might not exist
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
            const osc = ctx.createOscillator()
            osc.connect(ctx.destination)
            osc.frequency.value = 880
            osc.start()
            setTimeout(() => osc.stop(), 1000)
        } catch (e) {
            console.error("Audio play failed", e)
        }
        alert("Time is up!")
    }

    const toggleTimer = () => {
        setIsActive(!isActive)
    }

    const resetTimer = () => {
        setIsActive(false)
        setTimeLeft(duration)
    }

    const adjustTime = (amount: number) => {
        const newTime = Math.max(60, duration + amount)
        setDuration(newTime)
        if (!isActive) setTimeLeft(newTime)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <Card className="h-full w-full aspect-square bg-[#051F15] dark:bg-[#051F15] rounded-[2rem] p-4 shadow-soft flex flex-col justify-center items-center text-white relative border-none overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: 'url(/src/img/circuit.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            />

            <div className="text-center w-full relative z-10">
                <h3 className="text-gray-400 text-[10px] uppercase tracking-widest mb-2">Timer</h3>

                <div className="text-3xl font-mono font-bold tracking-wider mb-3 leading-none">
                    {formatTime(timeLeft)}
                </div>

                <div className="flex justify-center gap-3 mb-3">
                    <button onClick={() => adjustTime(-60)} className="text-gray-500 hover:text-white transition-colors"><Minus size={14} /></button>
                    <button onClick={() => adjustTime(60)} className="text-gray-500 hover:text-white transition-colors"><Plus size={14} /></button>
                </div>

                <div className="flex gap-2 justify-center">
                    <button
                        onClick={toggleTimer}
                        className="w-10 h-10 rounded-full bg-white text-[#0F5132] flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                    >
                        {isActive ? <Pause className="fill-current" size={16} /> : <Play className="fill-current ml-0.5" size={16} />}
                    </button>
                    <button
                        onClick={resetTimer}
                        className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg"
                    >
                        <Square className="fill-current" size={14} />
                    </button>
                </div>
            </div>
        </Card>
    )
}
