import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { CATEGORIES } from "@/types"

export default function Settings() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto space-y-6"
        >
            <h2 className="text-2xl font-bold tracking-tight">System Configuration</h2>

            <Card className="p-6 space-y-4">
                <h3 className="text-lg font-medium">Appearance</h3>
                <div className="flex items-center justify-between">
                    <span className="text-gray-600">Theme Mode</span>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm">Light</Button>
                        <Button variant="ghost" size="sm">Dark</Button>
                        <Button variant="ghost" size="sm">System</Button>
                    </div>
                </div>
            </Card>

            <Card className="p-6 space-y-6">
                <h3 className="text-lg font-medium">Category Colors</h3>
                <p className="text-sm text-gray-500 -mt-2">Customize the visual identity of your focus areas.</p>

                <div className="space-y-4">
                    {CATEGORIES.map(cat => (
                        <div key={cat.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: cat.color }} />
                                <span className="text-sm font-medium">{cat.name}</span>
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs">Edit</Button>
                        </div>
                    ))}
                </div>
            </Card>

            <Card className="p-6 space-y-4">
                <h3 className="text-lg font-medium">Data Management</h3>
                <div className="flex items-center justify-between">
                    <span className="text-gray-600">Export All Data</span>
                    <Button variant="secondary" size="sm">Download JSON</Button>
                </div>
            </Card>
        </motion.div>
    )
}
