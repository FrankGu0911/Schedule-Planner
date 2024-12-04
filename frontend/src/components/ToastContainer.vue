<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="flex items-center px-4 py-2 rounded-lg shadow-lg min-w-[200px] max-w-[400px]"
        :class="[
          toast.type === 'success' ? 'bg-green-500 text-white' :
          toast.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        ]"
      >
        <Icon
          :icon="
            toast.type === 'success' ? 'ph:check-circle-bold' :
            toast.type === 'error' ? 'ph:x-circle-bold' :
            'ph:info-bold'
          "
          class="w-5 h-5 mr-2 flex-shrink-0"
        />
        <span class="text-sm">{{ toast.message }}</span>
        <button
          @click="toastStore.remove(toast.id)"
          class="ml-auto p-1 hover:bg-white/10 rounded"
        >
          <Icon icon="ph:x-bold" class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { useToastStore } from '../stores/toast'

const toastStore = useToastStore()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style> 