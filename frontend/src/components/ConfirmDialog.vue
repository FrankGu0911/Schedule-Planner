<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" @close="$emit('update:show', false)" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25 dark:bg-black/40" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                {{ title }}
              </DialogTitle>
              <div class="mt-2">
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ message }}
                </p>
              </div>

              <div class="mt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
                  @click="$emit('update:show', false)"
                >
                  取消
                </button>
                <button
                  type="button"
                  class="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  @click="$emit('confirm')"
                >
                  确认
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'

defineProps({
  show: Boolean,
  title: String,
  message: String
})

defineEmits(['update:show', 'confirm'])
</script> 