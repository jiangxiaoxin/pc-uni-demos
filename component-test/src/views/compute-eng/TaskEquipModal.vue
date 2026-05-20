<template>
  <vxe-modal
    show-footer
    show-confirm-button
    show-cancel-button
    :width="600"
    :height="400"
    :confirm-closable="false"
    ref="modalRef"
    title="添加设备"
  >
  </vxe-modal>
</template>
<script setup lang="ts">
import { ref } from 'vue';
const modalRef = ref()


defineExpose({
    open: () => {
        modalRef.value?.open()
    }
})
</script>
