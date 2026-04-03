<template>
  <div style="width: 500px; height: 500px" ref="containerRef"></div>
</template>
<script setup>
  import BpmnModeler from "bpmn-js/lib/Modeler";
  import { onMounted, ref } from "vue";

    import demo1 from "../moddle-test/demo1"

  const containerRef = ref(null);


  onMounted(() => {
    const modeler = new BpmnModeler({
      container: containerRef.value,
    });

    demo1(modeler)
    
  });
</script>
