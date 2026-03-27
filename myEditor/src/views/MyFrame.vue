<template>
  <div class="phone-simulator-container">
    <select v-model="url" class="env-select">
      <option value="">请选择环境</option>
      <option value="http://localhost:5174">本地开发环境</option>
      <option value="https://v2-h5.uviewui.com/">线上预览环境</option>
    </select>

    <button @click="toChild">parent 向child 发送事件</button>
    <button @click="addQueue">addQueue</button>
    <button @click="doQueue">doQueue</button>

    <div class="phone-frame">
      <div class="phone-content">
        <iframe
          v-if="url"
          :src="url"
          class="phone-iframe"
          frameborder="0"
          scrolling="auto"
          ref="frameRef"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from "vue";

  const url = ref("");

  const frameRef = ref();

  const toChild = () => {
    frameRef.value?.contentWindow.postMessage("parent 向child 发送事件", "*");
  };

  onMounted(() => {
    window.addEventListener("message", (e) => {
      console.log("parent 收到消息", e);
    });
  });

  let queue: Array<{ time: number; resolve: Function; reject: Function }> = [];

  function methodA(time: number) {
    console.log("🚀 ~ MyFrame.vue:48 ~ methodA ~ time:", time);

    return new Promise((resolve, reject) => {
      console.log("add queue", time);

      setTimeout(() => {
        console.log("do timeout", time);
        
        if (time % 2 == 0) {
          resolve(time);
        } else {
          queue.push({
            time,
            resolve,
            reject,
          });
        }
      }, 2000);
    });
  }

  const addQueue = () => {
    methodA(Date.now())
      .then((res) => {
        console.log("🚀 ~ MyFrame.vue:45 ~ res:", res);
      })
      .catch((error) => {
        console.warn("🚀 ~ MyFrame.vue:49 ~ error:", error);
      });
  };

  const doQueue = () => {
    queue.forEach(({ time, resolve, reject }) => {
      // resolve(time);
      // if(time % 2 == 0) {
      //   resolve(time);
      // } else {
      //   reject(time);
      // }
    });
  };
</script>

<style scoped>
  .phone-simulator-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
  }

  .env-select {
    margin-bottom: 20px;
    padding: 10px 20px;
    font-size: 14px;
    border: none;
    border-radius: 8px;
    background: white;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    outline: none;
    min-width: 200px;
  }

  .phone-frame {
    /* background-color: #d12121; */
    width: 310px;
    height: 627.87024px;
    z-index: 10;
    margin: 0;
    box-sizing: border-box;
    overflow-y: auto;
    background-image: url("/iPhone13.png");
    background-repeat: no-repeat;
    background-size: 100%;
    border-radius: 30px;
    padding: 48px 13px 25px;
  }

  .phone-content {
    box-sizing: border-box;
    height: 100%;
    border-bottom-left-radius: 30px;
    border-bottom-right-radius: 30px;
  }

  .phone-iframe {
    width: 100%;
    height: 100%;
    border-bottom-left-radius: 30px;
    border-bottom-right-radius: 30px;
  }
</style>
