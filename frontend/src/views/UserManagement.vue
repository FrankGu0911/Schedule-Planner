<template>
  <MainLayout>
    <div class="max-w-[calc(100vw-20rem)] mx-auto">
      <!-- 筛选器 -->
      <div class="mb-6 flex items-center space-x-4">
        <select
          v-model="statusFilter"
          class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">所有状态</option>
          <option value="inactive">待激活</option>
          <option value="active">已激活</option>
          <option value="blocked">已禁用</option>
        </select>

        <select
          v-model="roleFilter"
          class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">所有角色</option>
          <option value="user">普通用户</option>
          <option value="admin">管理员</option>
        </select>

        <!-- 统计信息 -->
        <div class="ml-auto flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
          <div class="flex items-center space-x-2">
            <span class="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-full text-xs">
              待激活: {{ inactiveCount }}
            </span>
            <span class="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs">
              已激活: {{ activeCount }}
            </span>
            <span class="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full text-xs">
              已禁用: {{ blockedCount }}
            </span>
          </div>
          <div class="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
          <div class="flex items-center space-x-2">
            <span class="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded-full text-xs">
              管理员: {{ adminCount }}
            </span>
            <span class="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs">
              普通用户: {{ userCount }}
            </span>
          </div>
        </div>
      </div>

      <!-- 用户列表 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <!-- 表头 -->
          <div class="bg-gray-50 dark:bg-gray-700">
            <div class="grid grid-cols-6 gap-4 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <div>用户名</div>
              <div>角色</div>
              <div>状态</div>
              <div>创建时间</div>
              <div class="col-span-2">操作</div>
            </div>
          </div>

          <!-- 表格内容 -->
          <div class="divide-y divide-gray-200 dark:divide-gray-700">
            <div
              v-for="user in filteredUsers"
              :key="user.id"
              class="grid grid-cols-6 gap-4 px-6 py-4 text-sm text-gray-900 dark:text-gray-100"
            >
              <div class="flex items-center">
                <Icon icon="ph:user-circle" class="w-5 h-5 mr-2 text-gray-400" />
                {{ user.username }}
              </div>
              <div>
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  ]"
                >
                  {{ user.role === 'admin' ? '管理员' : '普通用户' }}
                </span>
              </div>
              <div>
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    user.status === 'active'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : user.status === 'inactive'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  ]"
                >
                  {{ 
                    user.status === 'active' ? '已激活' :
                    user.status === 'inactive' ? '待激活' :
                    '已禁用'
                  }}
                </span>
              </div>
              <div class="text-gray-500 dark:text-gray-400">
                {{ formatDate(user.created_at) }}
              </div>
              <div class="col-span-2 flex items-center space-x-2">
                <template v-if="user.status === 'inactive'">
                  <button
                    @click="activateUser(user.id)"
                    class="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm"
                  >
                    激活
                  </button>
                </template>
                <template v-else-if="user.status === 'active'">
                  <button
                    @click="blockUser(user.id)"
                    class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
                  >
                    禁用
                  </button>
                </template>
                <template v-else>
                  <button
                    @click="activateUser(user.id)"
                    class="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm"
                  >
                    解禁
                  </button>
                </template>

                <button
                  @click="changeRole(user.id, user.role === 'admin' ? 'user' : 'admin')"
                  class="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm"
                >
                  {{ user.role === 'admin' ? '设为用户' : '设为管理员' }}
                </button>

                <button
                  @click="openPasswordDialog(user.id)"
                  class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
                >
                  修改密码
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 密码修改对话框 -->
      <PasswordDialog
        v-model:show="showPasswordDialog"
        :is-admin="true"
        :loading="userManagementStore.loading"
        :error="userManagementStore.error"
        @submit="handlePasswordSubmit"
        @cancel="handlePasswordCancel"
      />
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useUserManagementStore } from '../stores/userManagement'
import { useToastStore } from '../stores/toast'
import { format } from 'date-fns'
import MainLayout from '../components/MainLayout.vue'
import PasswordDialog from '../components/PasswordDialog.vue'

const userManagementStore = useUserManagementStore()
const toastStore = useToastStore()
const showPasswordDialog = ref(false)
const selectedUserId = ref(null)

const statusFilter = ref('')
const roleFilter = ref('')

// 获取用户列表
userManagementStore.fetchUsers()

// 过滤用户列表
const filteredUsers = computed(() => {
  let users = userManagementStore.users
  
  if (statusFilter.value) {
    users = users.filter(user => user.status === statusFilter.value)
  }
  
  if (roleFilter.value) {
    users = users.filter(user => user.role === roleFilter.value)
  }
  
  return users
})

// 用户统计
const activeCount = computed(() => 
  userManagementStore.users.filter(user => user.status === 'active').length
)
const inactiveCount = computed(() => 
  userManagementStore.users.filter(user => user.status === 'inactive').length
)
const blockedCount = computed(() => 
  userManagementStore.users.filter(user => user.status === 'blocked').length
)
const adminCount = computed(() => 
  userManagementStore.users.filter(user => user.role === 'admin').length
)
const userCount = computed(() => 
  userManagementStore.users.filter(user => user.role === 'user').length
)

// 格式化日期
const formatDate = (date) => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm')
}

// 用户管理操作
const activateUser = async (userId) => {
  await userManagementStore.activateUser(userId)
}

const blockUser = async (userId) => {
  await userManagementStore.blockUser(userId)
}

const changeRole = async (userId, newRole) => {
  await userManagementStore.changeRole(userId, newRole)
}

const openPasswordDialog = (userId) => {
  selectedUserId.value = userId
  showPasswordDialog.value = true
  userManagementStore.error = null
}

const handlePasswordSubmit = async ({ newPassword, error }) => {
  if (error) {
    userManagementStore.error = error
    return
  }

  await userManagementStore.changePassword(selectedUserId.value, newPassword)
  if (!userManagementStore.error) {
    showPasswordDialog.value = false
    selectedUserId.value = null
    toastStore.success('密码修改成功')
  }
}

const handlePasswordCancel = () => {
  showPasswordDialog.value = false
  selectedUserId.value = null
  userManagementStore.error = null
}
</script> 