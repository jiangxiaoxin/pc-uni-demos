<template>
  <div class="hello-world">
    <h1 class="title">{{ msg }}</h1>
    <p class="desc">
      这是一个示例组件，你可以在
      <code>src/components/</code>
      目录下添加自己的组件进行开发和测试。
    </p>
    <div class="actions">
      <button class="btn" @click="count.val.num++">点击次数: {{ count }}</button>
      <button class="btn" @click="count = {val:{num:count.val.num+1}}">整个替换: {{ count }}</button>
      <button class="btn" @click="num++">改num: {{ num }}</button>
      <button class="btn" @click="changeFoo">改foo: {{ foo }}</button>
      <button class="btn" @click="changeBar">改bar: {{ bar }}</button>
      <button>{{ fooComputed }}</button>
      <button>{{ numComputed }}</button>
    </div>
    <div>
      <vnodeFn />
    </div>
    <div>
      <aicon />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, createVNode, h } from 'vue'
import {
    ZoomInOutlined,
    ZoomOutOutlined,
    FullscreenOutlined,
    ReloadOutlined,
    UndoOutlined,
    RedoOutlined,
    SaveOutlined,
    UploadOutlined,
    DeleteOutlined,
    EyeOutlined,
    CopyOutlined,
    DownloadOutlined,
  } from "@ant-design/icons-vue";

defineProps<{
  msg: string
}>()


const vnodeFn = () => {
  return createVNode(ZoomInOutlined)
}

const aicon = () => {
  return h(RedoOutlined)
}

/**
 * computed 返回 get 和 set 方法，验证啥时候重新触发 get 和 set
 */

/**
 * watch 下面
 * // 返回个comupted
// 直接就是个computed
get 方法返回个纯值: 怎么变都不会触发watch回调的
get 方法返回个纯对象: 同样不会触发
get 方法返回个ref对象
get 方法返回个computed【computed本身就是个ref】
 */

 let foo = 1

 watch(() => foo, (newval, oldval) => {
  console.log("watch foo", newval, oldval)
 })

 const changeFoo = () => {
  foo++
  console.log('change', foo);
  setTimeout(() => {
    console.log(fooComputed);
    
  }, 0);
 }

 /**
  * computed 普通值是不会响应式的
  * computed 的目的是根据内部所涉及的响应式数据计算想要的数据，当响应式数据变化时，触发computed 的重新计算
  * 所以重点是内部必须有响应式的数据
  */
 const fooComputed = computed(() => {
  return foo
 })

 watch(fooComputed, (newval, oldval) => {
   console.log('computed foo', newval, oldval);
   
 })

 

 let bar = {val: 1}
 watch(() => bar, (newval, oldval) => {
  console.log("watch bar", newval, oldval)
 })

 const changeBar = () => {
  bar.val++
  console.log('change', bar);
  // bar = {val: bar.val+1}
 }


const count = ref({
  val: {
    num: 100
  }
})

const num = ref(123)
watch(num, (newval, oldval) => {
  console.log('watch 住了 简单的ref', newval == oldval);
  console.log(newval)
})
/**
 *  watch count，count 是个对象，如果对象不变，只是对象内的属性变了，那默认情况下就不会被watch 住，
 * 如果想watch 全部变化，那就开deep
 * 如果是改变的对象内的属性，deep 虽然能触发，但是newval 和 oldval 却是同一个对象，所以无法比较前后的变化
 */
watch(count, (newval, oldval) => {
  console.log('watch 住了', newval == oldval);
  console.log(newval);
  
})

watch(count, (newval, oldval) => {
  console.log("deep watch 0000000", newval == oldval)
  console.log('00000', newval);
  
}, {deep:true})


const numComputed = computed(() => {
  return num.value
})

watch(numComputed, (newval, oldval) => {
  console.log('watch 住了numcomputed', newval == oldval);
  console.log(newval, oldval)
})

/**
 * () => computed.value 可以触发，但 () => computed 不会触发
 * 因为 computed 是一个固定对象，这个对象本身一直没有变化，所以不会触发.要想出发，需要启动deep
 */
watch(() => numComputed.value, (newval, oldval) => {
  console.log('get里返回computed.value', newval == oldval);
  console.log(newval, oldval)
})

watch(() => numComputed, (newval, oldval) => {
  console.log('get里返回computed', newval == oldval);
  console.log(newval, oldval)
}, {deep: true})


</script>

<style scoped>
.hello-world {
  padding: 16px 0;
}

.title {
  font-size: 20px;
  color: #2c3e50;
  margin-bottom: 12px;
}

.desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
}

.desc code {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.actions {
  margin-top: 12px;
}

.btn {
  padding: 8px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn:hover {
  background: #5568d3;
}
</style>
