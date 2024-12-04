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
import axios from 'axios'

const authStore = useAuthStore()
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
    const response = await axios.put(
      'http://localhost:8080/api/v1/users/password',
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
      alert('密码修改成功')
      showDialog.value = false
    }
  } catch (err) {
    error.value = err.response?.data?.error || '修改密码失败'
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