<template>
  <div class="fixed top-4 left-1/2 -translate-x-1/2 z-50 space-y-2 pointer-events-none min-w-[20rem] max-w-[30rem]">
    <TransitionGroup
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform -translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-2 opacity-0"
      move-class="transition duration-300"
    >
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="flex items-center px-4 py-3 rounded-lg shadow-lg pointer-events-auto w-full"
        :class="[
          toast.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
          toast.type === 'error' ? 'bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
          'bg-gray-50 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
        ]"
      >
        <Icon
          :icon="
            toast.type === 'success' ? 'ph:check-circle-bold' :
            toast.type === 'error' ? 'ph:x-circle-bold' :
            'ph:info-bold'
          "
          :class="[
            'w-5 h-5 mr-2 flex-shrink-0',
            toast.type === 'success' ? 'text-green-500 dark:text-green-400' :
            toast.type === 'error' ? 'text-red-500 dark:text-red-400' :
            'text-gray-500 dark:text-gray-400'
          ]"
        />
        <span class="mr-2">{{ toast.message }}</span>
        <button
          @click="toastStore.close(toast.id)"
          class="ml-auto p-1 rounded-lg opacity-75 hover:opacity-100 focus:outline-none flex-shrink-0"
          :class="[
            toast.type === 'success' ? 'hover:bg-green-100 dark:hover:bg-green-800' :
            toast.type === 'error' ? 'hover:bg-red-100 dark:hover:bg-red-800' :
            'hover:bg-gray-100 dark:hover:bg-gray-800'
          ]"
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