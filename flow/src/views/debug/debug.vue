<template>
    <h1>debug</h1>
    <Comp :title="msg"/>
</template>

<script setup lang="tsx">
import {ref, h, defineComponent} from 'vue'
const msg = ref("hello")

const Comp = defineComponent({
    props: {
        title: {
            type: String,
            default: "bye"
        }
    },
    setup(props) {
        return () => <div>{props.title}</div>
    }
})

</script>