import { localService } from '@/services/localService'

export interface NotificationSettings {
    pushNotifications: boolean
    audioAlarms: boolean
}

class NotificationManager {
    private static instance: NotificationManager
    private notificationSound: HTMLAudioElement | null = null

    private constructor() {
        // Create notification sound (simple beep using data URI)
        this.notificationSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTcIGWi77eefTRAMUKfj8LZjHAY4ktfzz3osBSR3x/DdkEAKFF606+2oVRQKRp/g8r5sIQUrgs/z2og4CBlouu3nn0wQDFCn4/C2YxwGOJLX88+BhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTcIGWi77eefTRAMUKfj8LZjHAY4ktfzz3osBSR3x/DdkEAKFF606+2oVRQKRp/g8r5sIQUrgs/z2og4CBlouu3nn0wQDFCo4/C1YxwGOJLX889TEUlo1PLJeTAIIHnJ8dx5OAkccL3r8qBIEw1NpOjxumQdBjCN1vLNeCsFJnfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTcIGWi77eefTRAMUKfj8LZjHAY4ktfzz3osBSR3x/DdkEAKFF606+2oVRQKRp/g8r5sIQUrgs/z2og4CBlouu3nn0wQDFCn4/C2YxwGOJLX88+BhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSquBzvLZiTgIGWi+7e+fTRAMUKfj8LZjHAY4ktfzz3osBSR3x/DdkEAKFF606+2oVRQKRp/g8r5sIQUrgs/z2Yg4CBlouu3nn0wQDFCn4/C2YxwGOJLX88+BhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTcIGWi77eefTRAMUKfj8LZjHAY4ktfzz3osBSR3x/DdkEAKFF606+2oVRQKRp/g8r5sIQUrgs/z2Yg4CBlouu3nn0wQDFCn4/C2YxwGOJLX88+BhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTcIGWi77eefTRAMUKfj8LZjHAY4ktfzz3osBSR3x/DdkEAKFF606+2oVRQKRp/g8r5sIQUrgs/z')
    }

    static getInstance(): NotificationManager {
        if (!NotificationManager.instance) {
            NotificationManager.instance = new NotificationManager()
        }
        return NotificationManager.instance
    }

    async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications')
            return false
        }

        if (Notification.permission === 'granted') {
            return true
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission()
            return permission === 'granted'
        }

        return false
    }

    async sendNotification(title: string, body: string): Promise<void> {
        const settings = localService.getNotificationSettings()

        if (!settings.pushNotifications) {
            return
        }

        const hasPermission = await this.requestPermission()

        if (hasPermission) {
            new Notification(title, {
                body,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'deadline-notification',
                requireInteraction: true
            })
        }
    }

    playAlarm(): void {
        const settings = localService.getNotificationSettings()

        if (!settings.audioAlarms) {
            return
        }

        if (this.notificationSound) {
            this.notificationSound.currentTime = 0
            this.notificationSound.play().catch(err => {
                console.warn('Could not play notification sound:', err)
            })
        }
    }

    stopAlarm(): void {
        if (this.notificationSound) {
            this.notificationSound.pause()
            this.notificationSound.currentTime = 0
        }
    }
}

export const notificationManager = NotificationManager.getInstance()
