<template>
  <div style="width: 500px; height: 500px;background-color: bisque;" ref="containerRef"></div>
  <button @click="doPrint">test</button>
</template>
<script setup lang="ts">
  import BpmnModeler from "bpmn-js/lib/Modeler";
  import { onMounted, ref } from "vue";

  import demo1 from "../moddle-test/demo1";
  import demo2 from "../moddle-test/demo2"
  import demo3 from "../moddle-test/demo3"
  
  // 导入 flowable 描述文件（用于 demo3）
  import flowableModdle from "../moddle-test/flowable.json"

  const containerRef = ref(null);

  let modeler = null;
  onMounted(() => {
    modeler = new BpmnModeler({
      container: containerRef.value,
      // 配置 flowable 命名空间扩展
      moddleExtensions: {
        flowable: flowableModdle
      }
    });
  });

  const doPrint = () => {
    // demo1(modeler);
    // demo2(modeler);
    demo3(modeler);
  };
</script>
