<template>
 <div class="basic-msg">{{ msg }}</div>
 <div>{{ $globalmsg }}</div>

 <button @click="data.hi">btn</button>
 <button @click="changeHi">change</button>
 <div>{{ data.hi }}</div>

</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';


defineProps({
    msg: {
        type: String,
        default: '我是默认消息'
    }
})

const data = reactive({
    hi: () => {
        alert('hi')
    }
})

const changeHi = () => {
    data.hi = () => {
        alert('change hi')
    }
}

watch(data, (newval, oldval) => {
    console.log('watch change', newval);
    console.log(newval == oldval);
    
    
})

</script>
<style lang="scss" scoped>
.basic-msg {
    color: red;
    padding: 10px 10px;
    border-radius: 4px;
    border: 1px solid blue;
    background-color: #eee;
    font-size: 14px;
}

</style>