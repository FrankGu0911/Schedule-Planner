<template>
  <MainLayout>
    <div class="max-w-md mx-auto">
      <PasswordDialog
        v-model:show="showDialog"
        :is-admin="false"
        :loading="loading"
        :error="error"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MainLayout from '../components/MainLayout.vue'
import PasswordDialog from '../components/PasswordDialog.vue'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import axios from 'axios'
import { API_CONFIG } from '../config/env'

const api = axios.create(API_CONFIG)

const authStore = useAuthStore()
const toastStore = useToastStore()
const showDialog = ref(true)
const loading = ref(false)
const error = ref('')

const handleSubmit = async ({ currentPassword, newPassword, error: validationError }) => {
  if (validationError) {
    error.value = validationError
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await api.put(
      '/users/password',
      {
        currentPassword,
        newPassword
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    if (response.data?.message) {
      toastStore.show('密码修改成功', 'success')
      showDialog.value = false
    }
  } catch (err) {
    error.value = err.response?.data?.error || '修改密码失败'
    toastStore.show(err.response?.data?.error || '修改密码失败', 'error')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  showDialog.value = false
  error.value = ''
  history.back()
}

onMounted(() => {
  showDialog.value = true
})
</script> 