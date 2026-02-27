import api from './api'
import type { NotificationResponseDTO, PageResponse } from '../types'

// ─── NOTIFICATION SERVICE ─────────────────────────────────────────────────────
// Connects to: notification-service via API Gateway at /api/v1/notifications
// Features real-time push via SSE (Server-Sent Events)
// ─────────────────────────────────────────────────────────────────────────────

const notificationService = {
  /**
   * GET /api/v1/notifications
   * Get all notifications for the current user (paginated).
   */
  getNotifications: async (page = 0, size = 20): Promise<PageResponse<NotificationResponseDTO>> => {
    const response = await api.get<PageResponse<NotificationResponseDTO>>('/notifications', {
      params: { page, size },
    })
    return response.data
  },

  /**
   * PUT /api/v1/notifications/{notifId}
   * Mark a single notification as read.
   */
  markAsRead: async (notifId: number): Promise<NotificationResponseDTO> => {
    const response = await api.put<NotificationResponseDTO>(`/notifications/${notifId}`)
    return response.data
  },

  /**
   * PUT /api/v1/notifications/mark-all-read
   * Mark ALL notifications as read.
   */
  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/mark-all-read')
  },

  /**
   * Create an SSE EventSource connection for real-time notifications.
   * GET /api/v1/notifications/stream
   *
   * SSE = Server-Sent Events: the server pushes data to the client in real-time
   * without the client having to poll repeatedly.
   *
   * @param onMessage - Callback when a new notification arrives
   * @param onError - Callback when connection error occurs
   * @returns The EventSource object (call .close() to disconnect)
   */
  subscribeToStream: (
    onMessage: (notification: NotificationResponseDTO) => void,
    onError?: (err: Event) => void
  ): EventSource => {
    const token = localStorage.getItem('token')
    // SSE requires the token in the URL as EventSource doesn't support custom headers
    const url = `/api/v1/notifications/stream?token=${token}`

    const eventSource = new EventSource(url)

    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const notification = JSON.parse(event.data as string) as NotificationResponseDTO
        onMessage(notification)
      } catch (err) {
        console.error('Failed to parse SSE notification:', err)
      }
    }

    eventSource.onerror = (err: Event) => {
      console.error('SSE connection error:', err)
      if (onError) onError(err)
    }

    return eventSource
  },
}

export default notificationService
