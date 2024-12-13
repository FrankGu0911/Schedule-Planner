<template>
  <MainLayout>
    <div class="w-full lg:max-w-[calc(100vw-20rem)] lg:mx-auto">
      <!-- 筛选器和统计信息 -->
      <div class="mb-6 flex flex-col lg:flex-row gap-4 lg:items-center">
        <div class="flex flex-wrap gap-2">
          <Dropdown
            v-model="statusFilter"
            :options="[
              { value: '', label: '所有状态' },
              { value: 'inactive', label: '待激活', color: { backgroundColor: '#FEF3C7', color: '#92400E' } },
              { value: 'active', label: '已激活', color: { backgroundColor: '#DCFCE7', color: '#166534' } },
              { value: 'blocked', label: '已禁用', color: { backgroundColor: '#FEE2E2', color: '#991B1B' } }
            ]"
            placeholder="选择状态"
            class="flex-1 lg:flex-none w-full lg:w-40"
          />

          <Dropdown
            v-model="roleFilter"
            :options="[
              { value: '', label: '所有角色' },
              { value: 'user', label: '普通用户', color: { backgroundColor: '#DBEAFE', color: '#1E40AF' } },
              { value: 'admin', label: '管理员', color: { backgroundColor: '#F3E8FF', color: '#6B21A8' } }
            ]"
            placeholder="选择角色"
            class="flex-1 lg:flex-none w-full lg:w-40"
          />
        </div>

        <!-- 统计信息 -->
        <div class="flex flex-wrap gap-2 lg:ml-auto">
          <div class="flex flex-wrap gap-2">
            <span class="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-full text-xs whitespace-nowrap">
              待激活: {{ inactiveCount }}
            </span>
            <span class="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs whitespace-nowrap">
              已激活: {{ activeCount }}
            </span>
            <span class="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full text-xs whitespace-nowrap">
              已禁用: {{ blockedCount }}
            </span>
          </div>
          <div class="hidden lg:block h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
          <div class="flex flex-wrap gap-2">
            <span class="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded-full text-xs whitespace-nowrap">
              管理员: {{ adminCount }}
            </span>
            <span class="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs whitespace-nowrap">
              普通用户: {{ userCount }}
            </span>
          </div>
        </div>
      </div>

      <!-- 用户列表 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <!-- 桌面端表格 -->
        <div class="hidden lg:block min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <!-- 表头 -->
          <div class="bg-gray-50 dark:bg-gray-700">
            <div class="grid grid-cols-6 gap-4 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <div>用户名</div>
              <div>角色</div>
              <div>状态</div>
              <div>最后活跃</div>
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
                {{ formatDate(user.last_active ? user.last_active + 'Z' : null) }}
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
                    :disabled="user.id === authStore.user?.id"
                    class="px-3 py-1 text-white rounded-lg text-sm"
                    :class="[
                      user.id === authStore.user?.id
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600'
                    ]"
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

                <button
                  @click="deleteUser(user.id, user.username)"
                  :disabled="user.id === authStore.user?.id"
                  class="px-3 py-1 text-white rounded-lg text-sm"
                  :class="[
                    user.id === authStore.user?.id
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600'
                  ]"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 移动端卡片列表 -->
        <div class="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            class="p-4 space-y-4"
          >
            <!-- 用户信息 -->
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <Icon icon="ph:user-circle" class="w-6 h-6 mr-2 text-gray-400" />
                <span class="text-base font-medium text-gray-900 dark:text-gray-100">
                  {{ user.username }}
                </span>
              </div>
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

            <!-- 状态和时间 -->
            <div class="flex items-center justify-between text-sm">
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
              <span class="text-gray-500 dark:text-gray-400">
                {{ formatDate(user.last_active ? user.last_active + 'Z' : null) }}
              </span>
            </div>

            <!-- 操作按钮 -->
            <div class="flex flex-wrap gap-2">
              <template v-if="user.status === 'inactive'">
                <button
                  @click="activateUser(user.id)"
                  class="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm"
                >
                  激活
                </button>
              </template>
              <template v-else-if="user.status === 'active'">
                <button
                  @click="blockUser(user.id)"
                  :disabled="user.id === authStore.user?.id"
                  class="flex-1 px-3 py-2 text-white rounded-lg text-sm"
                  :class="[
                    user.id === authStore.user?.id
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600'
                  ]"
                >
                  禁用
                </button>
              </template>
              <template v-else>
                <button
                  @click="activateUser(user.id)"
                  class="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm"
                >
                  解禁
                </button>
              </template>

              <button
                @click="changeRole(user.id, user.role === 'admin' ? 'user' : 'admin')"
                class="flex-1 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm whitespace-pre-line min-w-[80px]"
                v-text="user.role === 'admin' ? `设为
用户` : `设为
管理员`"
              ></button>

              <button
                @click="openPasswordDialog(user.id)"
                class="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm whitespace-pre-line min-w-[80px]"
                v-text="`修改
密码`"
              ></button>

              <button
                @click="deleteUser(user.id, user.username)"
                :disabled="user.id === authStore.user?.id"
                class="flex-1 px-3 py-2 text-white rounded-lg text-sm"
                :class="[
                  user.id === authStore.user?.id
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600'
                ]"
              >
                删除
              </button>
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

      <!-- 确认对话框 -->
      <ConfirmDialog
        v-model:show="showConfirmDialog"
        title="确认删除"
        :message="`确定要删除用户 '${confirmDialogData.username}' 吗？此操作不可恢复。`"
        @confirm="handleConfirm"
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
import ConfirmDialog from '../components/ConfirmDialog.vue'
import Dropdown from '../components/Dropdown.vue'
import { useAuthStore } from '../stores/auth'

const userManagementStore = useUserManagementStore()
const toastStore = useToastStore()
const authStore = useAuthStore()
const showPasswordDialog = ref(false)
const selectedUserId = ref(null)
const showConfirmDialog = ref(false)
const confirmDialogData = ref({
  userId: null,
  username: '',
  action: ''
})

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
  if (!date) return '从未活跃';
  try {
    return format(new Date(date), 'yyyy-MM-dd HH:mm');
  } catch (error) {
    console.error('Invalid date:', date);
    return '无效时间';
  }
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

// 修改删除用户方法
const deleteUser = (userId, username) => {
  confirmDialogData.value = {
    userId,
    username,
    action: 'delete'
  }
  showConfirmDialog.value = true
}

// 添加确认对话框处理方法
const handleConfirm = async () => {
  showConfirmDialog.value = false
  if (confirmDialogData.value.action === 'delete') {
    await userManagementStore.deleteUser(confirmDialogData.value.userId)
    if (!userManagementStore.error) {
      toastStore.success('用户删除成功')
    }
  }
}
</script> 