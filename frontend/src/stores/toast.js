import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: []
  }),

  actions: {
    show(message, type = 'info', duration = 3000) {
      const id = Date.now()
      this.toasts.push({ id, message, type })

      if (duration > 0) {
        setTimeout(() => {
          this.close(id)
        }, duration)
      }
    },

    close(id) {
      const index = this.toasts.findIndex(toast => toast.id === id)
      if (index > -1) {
        this.toasts.splice(index, 1)
      }
    },

    success(message, duration = 3000) {
      this.show(message, 'success', duration)
    },

    error(message, duration = 3000) {
      this.show(message, 'error', duration)
    },

    info(message, duration = 3000) {
      this.show(message, 'info', duration)
    }
  }
}) 