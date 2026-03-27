<template>
  <div class="flex">
    <VueDraggable
      v-model="list1"
      animation="150"
      ghostClass="ghost"
      group="people"
      @update="onUpdate"
      @add="onAdd"
      @remove="remove"
      style="display: flex; flex-direction: column; width: 300px; height: 300px; overflow: auto;background-color: red;"
    >
      <div
        v-for="item in list1"
        :key="item.id"
        class="cursor-move h-30 bg-gray-500/5 rounded p-3"
      >
        {{ item.name }}
      </div>
    </VueDraggable>
    <VueDraggable
      style="display: flex; flex-direction: column; width: 300px; height: 300px; overflow: auto;background-color: blue;"
      v-model="list2"
      animation="150"
      group="people"
      ghostClass="ghost"
      @update="onUpdate"
      @add="onAdd"
      @remove="remove"
    >
      <div
        v-for="item in list2"
        :key="item.id"
        class="cursor-move h-30 bg-gray-500/5 rounded p-3"
      >
        {{ item.name }}
      </div>
    </VueDraggable>
  </div>
  <div class="flex justify-between">
    <preview-list :list="list1" />
    <preview-list :list="list2" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
const list1 = ref([
  {
    name: 'Joao',
    id: '1'
  },
  {
    name: 'Jean',
    id: '2'
  },
  {
    name: 'Johanna',
    id: '3'
  },
  {
    name: 'Juan',
    id: '4'
  }
])
const list2 = ref(
  list1.value.map(item => ({
    name: `${item.name}-2`,
    id: `${item.id}-2`
  }))
)
function onUpdate() {
  console.log('update')
}
function onAdd() {
  console.log('add')
}
function remove() {
  console.log('remove')
}
</script>
