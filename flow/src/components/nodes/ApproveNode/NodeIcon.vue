<template>
  <svg class="fx-icon" viewBox="0 0 256 256" :width="width" :height="height">
    <g filter="url(#svg-icon-0)">
      <path
        fill="url(#svg-icon-2)"
        d="M53 171a6 6 0 0 1 6-6h138a6 6 0 0 1 6 6v41c0 8.837-7.163 16-16 16H69c-8.837 0-16-7.163-16-16v-41Z"
      ></path>
      <path
        fill="url(#svg-icon-1)"
        d="M127.61 28c27.517 0 49.824 22.307 49.824 49.823 0 19.846-11.605 36.98-28.398 44.991.703 13.178 11.611 23.648 24.964 23.648h23c17.121 0 31 13.879 31 31V194a2 2 0 0 1-2 2H30a2 2 0 0 1-2-2v-16.538c0-17.121 13.88-31 31-31h23c13.234 0 24.064-10.283 24.94-23.295-17.2-7.853-29.153-25.201-29.153-45.344C77.787 50.307 100.094 28 127.61 28Z"
      ></path>
      <circle
        fill="#fff"
        r="20.5"
        cy="77.5"
        cx="127.5"
        data-follow-fill="#fff"
      ></circle>
    </g>
    <defs>
      <linearGradient
        gradientUnits="userSpaceOnUse"
        y2="279.098"
        x2="178.939"
        y1="177.5"
        x1="164.5"
        id="svg-icon-2"
      >
        <stop stop-color="#78CCFA"></stop>
        <stop stop-color="#44B2F2" offset="1"></stop>
      </linearGradient>
      <linearGradient
        gradientUnits="userSpaceOnUse"
        y2="29.344"
        x2="26.3"
        y1="196"
        x1="158"
        id="svg-icon-1"
      >
        <stop stop-color="#01A3F7" offset="0.347"></stop>
        <stop stop-color="#0AC0FA" offset="1"></stop>
      </linearGradient>
      <filter
        color-interpolation-filters="sRGB"
        filterUnits="userSpaceOnUse"
        height="256"
        width="256"
        y="0"
        x="0"
        id="svg-icon-0"
      >
        <feFlood result="BackgroundImageFix" flood-opacity="0"></feFlood>
        <feBlend
          result="shape"
          in2="BackgroundImageFix"
          in="SourceGraphic"
        ></feBlend>
        <feColorMatrix
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          in="SourceAlpha"
        ></feColorMatrix>
        <feMorphology
          result="effect1_innerShadow_33064_333432"
          in="SourceAlpha"
          radius="24"
        ></feMorphology>
        <feOffset></feOffset>
        <feGaussianBlur stdDeviation="24"></feGaussianBlur>
        <feComposite
          k3="1"
          k2="-1"
          operator="arithmetic"
          in2="hardAlpha"
        ></feComposite>
        <feColorMatrix
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.02 0"
        ></feColorMatrix>
        <feBlend
          result="effect1_innerShadow_33064_333432"
          in2="shape"
        ></feBlend>
      </filter>
    </defs>
  </svg>
</template>
<script setup lang="ts">
  import { computed } from "vue";

  const props = defineProps({
    width: {
      type: Number,
      default: 16,
    },
    height: {
      type: Number,
      default: 16,
    },
  });
  const width = computed(() => {
    return `${props.width}px`;
  });
  const height = computed(() => {
    return `${props.height}px`;
  });
</script>
