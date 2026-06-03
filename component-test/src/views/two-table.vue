<template>
  <div class="whole-page">
    <div class="parent">
      <tableVxe />
    </div>
    <div class="child">
      <tableVxe />
    </div>
  </div>
</template>
<script setup lang="ts">

  import { ref } from "vue";
  import tableVxe from "./table-vxe.vue";
</script>
<style lang="scss" scoped>

  .whole-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;

    .parent,
    .child {
      flex: 1;
      overflow: hidden;
      min-height: 0;
    }

  }
</style>
