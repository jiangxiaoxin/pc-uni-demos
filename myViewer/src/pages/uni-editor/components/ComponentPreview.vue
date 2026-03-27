<template>
  <view class="component-preview">
    <!-- 按钮 -->
    <template v-if="type === 'u-button'">
      <u-button :text="props?.text || '按钮'" type="primary" size="default" />
    </template>
    
    <!-- 输入框 -->
    <template v-else-if="type === 'u-input'">
      <u-input 
        :placeholder="props?.placeholder || '请输入'" 
        border="surround"
        fontSize="28rpx"
      />
    </template>
    
    <!-- 选择器 -->
    <template v-else-if="type === 'u-picker'">
      <u-button text="打开选择器" type="primary" size="default" />
    </template>
    
    <!-- 搜索框 -->
    <template v-else-if="type === 'u-search'">
      <u-search 
        :placeholder="'搜索关键词'" 
        :show-action="false"
        height="72rpx"
      />
    </template>
    
    <!-- 开关 -->
    <template v-else-if="type === 'u-switch'">
      <view class="switch-wrapper">
        <u-switch v-model="switchValue" activeColor="#2979ff" />
      </view>
    </template>
    
    <!-- 默认 -->
    <template v-else>
      <view class="unknown-component">
        <text>{{ type }}</text>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  type: string
  props?: Record<string, any>
}

defineProps<Props>()

// 开关状态
const switchValue = ref(true)
</script>

<style scoped>
.component-preview {
  width: 100%;
}

.switch-wrapper {
  display: flex;
  justify-content: flex-start;
  padding: 10rpx 0;
}

.unknown-component {
  padding: 30rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  text-align: center;
  color: #999;
  font-size: 24rpx;
}
</style>
