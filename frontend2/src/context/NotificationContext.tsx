import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react'
import notificationService from '../services/notificationService'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'
import type { NotificationResponseDTO } from '../types'

// ─── NOTIFICATION CONTEXT ──────────────────────────────────────────────────────
// Manages real-time notifications using SSE (Server-Sent Events).
// SSE = the server continuously pushes updates to us (like a one-way WebSocket).
// When a manager approves your goal, you instantly get a notification!
// ─────────────────────────────────────────────────────────────────────────────

interface NotificationContextValue {
  notifications: NotificationResponseDTO[]
  unreadCount: number
  loading: boolean
  loadNotifications: () => Promise<void>
  markAsRead: (notifId: number) => Promise<void>
  markAllAsRead: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  // List of notifications loaded from the server
  const [notifications, setNotifications] = useState<NotificationResponseDTO[]>([])
  // Count of unread notifications (shown as a badge on the bell icon)
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)

  const { user } = useAuth()
  // ref to keep track of the SSE connection (so we can close it on logout)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Load initial notifications when user logs in
  useEffect(() => {
    if (user) {
      loadNotifications()
      startSSEStream()
    } else {
      // User logged out: close SSE connection and clear notifications
      stopSSEStream()
      setNotifications([])
      setUnreadCount(0)
    }

    // Cleanup: close SSE when component unmounts
    return () => stopSSEStream()
  }, [user])

  // Load notifications from the REST API
  const loadNotifications = async (): Promise<void> => {
    try {
      setLoading(true)
      const data = await notificationService.getNotifications(0, 50)
      // The API returns paginated data: { content: [...], totalElements, ... }
      const notifList: NotificationResponseDTO[] = data?.content || []
      setNotifications(notifList)
      // Count how many are unread
      setUnreadCount(notifList.filter((n) => n.status === 'UNREAD').length)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Start SSE connection for real-time updates
  const startSSEStream = (): void => {
    stopSSEStream() // close any existing connection first

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      eventSourceRef.current = notificationService.subscribeToStream(
        // On new notification received:
        (newNotification: NotificationResponseDTO) => {
          setNotifications((prev) => [newNotification, ...prev])
          setUnreadCount((prev) => prev + 1)
          // Show a toast popup for important notifications
          const n = newNotification as NotificationResponseDTO & {
            priority?: string
            actionRequired?: boolean
          }
          if (n.priority === 'HIGH' || n.actionRequired) {
            toast(newNotification.message, { icon: '🔔' })
          }
        },
        // On error:
        (err: Event) => {
          console.warn('SSE error, will retry...', err)
        }
      )
    } catch (err) {
      console.error('Failed to start SSE stream:', err)
    }
  }

  // Stop SSE connection
  const stopSSEStream = (): void => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
  }

  // Mark a single notification as read
  const markAsRead = async (notifId: number): Promise<void> => {
    try {
      await notificationService.markAsRead(notifId)
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notifId ? { ...n, status: 'READ' as const } : n
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      toast.error('Failed to mark notification as read')
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async (): Promise<void> => {
    try {
      await notificationService.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'READ' as const })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to mark all as read')
    }
  }

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

// Custom hook to use notifications anywhere in the app
// Usage: const { notifications, unreadCount, markAsRead } = useNotifications()
export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used inside <NotificationProvider>')
  }
  return context
}
