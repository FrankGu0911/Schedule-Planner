<template>
  <div class="dropdown-container" v-click-outside="close">
    <button
      @click="isOpen = !isOpen"
      class="dropdown-trigger"
      :class="{ 'is-active': isOpen }"
    >
      <div class="trigger-content">
        <template v-if="multiple && modelValue?.length">
          <div class="selected-tags">
            <span 
              v-for="value in modelValue" 
              :key="value" 
              class="tag"
              :style="getTagStyle(value)"
            >
              {{ getOptionLabel(value) }}
            </span>
          </div>
        </template>
        <span v-else class="trigger-text">{{ triggerText }}</span>
      </div>
      <Icon 
        :icon="isOpen ? 'ph:caret-up-bold' : 'ph:caret-down-bold'" 
        class="w-4 h-4 text-gray-500 dark:text-gray-400"
      />
    </button>

    <div v-show="isOpen" class="dropdown-content">
      <template v-if="multiple">
        <div
          v-for="option in options"
          :key="option.value"
          @click="toggleOption(option)"
          class="dropdown-item"
          :class="{ 'is-selected': isSelected(option) }"
        >
          <div class="checkbox">
            <Icon 
              v-if="isSelected(option)"
              icon="ph:check-bold" 
              class="w-4 h-4"
            />
          </div>
          <span 
            class="item-label"
            :style="getTagStyle(option.value)"
          >{{ option.label }}</span>
        </div>
      </template>
      <template v-else>
        <div
          v-for="option in options"
          :key="option.value"
          @click="selectOption(option)"
          class="dropdown-item"
          :class="{ 'is-selected': modelValue === option.value }"
        >
          <span 
            class="item-label"
            :style="option.color ? getTagStyle(option.value) : {}"
          >{{ option.label }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { vClickOutside } from '../directives/click-outside'

const props = defineProps({
  modelValue: {
    type: [String, Array],
    default: ''
  },
  options: {
    type: Array,
    required: true
  },
  multiple: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: '请选择'
  }
})

const emit = defineEmits(['update:modelValue'])
const isOpen = ref(false)

// 计算显示的文本
const triggerText = computed(() => {
  if (props.multiple) {
    if (!props.modelValue?.length) return props.placeholder
    return props.placeholder
  } else {
    const option = props.options.find(opt => opt.value === props.modelValue)
    return option?.label || props.placeholder
  }
})

// 获取选项的标签文本
const getOptionLabel = (value) => {
  const option = props.options.find(opt => opt.value === value)
  return option?.label || value
}

// 判断选项是否被选中（多选模式）
const isSelected = (option) => {
  return props.multiple && props.modelValue?.includes(option.value)
}

// 切换选项（多选模式）
const toggleOption = (option) => {
  if (!props.multiple) return
  const newValue = [...(props.modelValue || [])]
  const index = newValue.indexOf(option.value)
  if (index === -1) {
    newValue.push(option.value)
  } else {
    newValue.splice(index, 1)
  }
  emit('update:modelValue', newValue)
}

// 选择选项（单选模式）
const selectOption = (option) => {
  if (props.multiple) return
  emit('update:modelValue', option.value)
  close()
}

// 关闭下拉框
const close = () => {
  isOpen.value = false
}

// 标签颜色映射
const tagColors = [
  { bgColor: '#E9F5FE', textColor: '#0369A1' }, // 蓝色
  { bgColor: '#F0FDF4', textColor: '#166534' }, // 绿色
  { bgColor: '#FEF3F2', textColor: '#9F1239' }, // 红色
  { bgColor: '#FDF4FF', textColor: '#86198F' }, // 紫色
  { bgColor: '#FFF7ED', textColor: '#9A3412' }, // 橙色
  { bgColor: '#F5F3FF', textColor: '#5B21B6' }  // 靛蓝
]

// 获取标签样式
const getTagStyle = (value) => {
  const option = props.options.find(opt => opt.value === value)
  if (option?.color) return option.color

  // 使用哈希函数生成固定的颜色索引
  const index = Math.abs(hashCode(value)) % tagColors.length
  const colors = tagColors[index]
  
  return {
    backgroundColor: colors.bgColor,
    color: colors.textColor
  }
}

// 简单的字符串哈希函数
const hashCode = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash = hash & hash
  }
  return hash
}
</script>

<style scoped>
.dropdown-container {
  position: relative;
  display: inline-block;
  width: 100%;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #4a5568;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

:root[class~="dark"] .dropdown-trigger {
  background: #1a202c;
  border-color: #4a5568;
  color: #e2e8f0;
}

.dropdown-trigger:hover {
  border-color: #cbd5e0;
}

:root[class~="dark"] .dropdown-trigger:hover {
  border-color: #718096;
}

.dropdown-trigger.is-active {
  border-color: #4299e1;
  box-shadow: 0 0 0 1px #4299e1;
}

.trigger-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-height: 20px;
}

.selected-tags {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-width: 100%;
}

.trigger-text {
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-content {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 50;
  max-height: 250px;
  overflow-y: auto;
}

:root[class~="dark"] .dropdown-content {
  background: #1a202c;
  border-color: #4a5568;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s;
}

:root[class~="dark"] .dropdown-item {
  color: #e2e8f0;
}

.dropdown-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

:root[class~="dark"] .dropdown-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.dropdown-item.is-selected {
  background: rgba(0, 0, 0, 0.03);
}

:root[class~="dark"] .dropdown-item.is-selected {
  background: rgba(255, 255, 255, 0.03);
}

.item-label {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.875rem;
  white-space: nowrap;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  color: #4299e1;
}

:root[class~="dark"] .checkbox {
  border-color: #4a5568;
  color: #90cdf4;
}

.is-selected .checkbox {
  background: #4299e1;
  border-color: #4299e1;
  color: white;
}

:root[class~="dark"] .is-selected .checkbox {
  background: #4299e1;
  border-color: #4299e1;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  white-space: nowrap;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style> 