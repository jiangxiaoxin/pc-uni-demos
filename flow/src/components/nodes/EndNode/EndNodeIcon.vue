<template>
  <svg class="fx-icon" viewBox="0 0 256 256" :width="width" :height="height">
    <g filter="url(#svg-icon-22)">
      <circle
        fill="url(#svg-icon-23)"
        r="103.68"
        cy="131.255"
        cx="128.731"
      ></circle>
      <rect
        fill="#fff"
        rx="12"
        height="72.576"
        width="72.576"
        y="94.969"
        x="92.449"
        data-follow-fill="#fff"
      ></rect>
    </g>
    <defs>
      <linearGradient
        gradientUnits="userSpaceOnUse"
        y2="-20.434"
        x2="-101.97"
        y1="228.5"
        x1="199.5"
        id="svg-icon-23"
      >
        <stop stop-color="#8995A6"></stop>
        <stop stop-color="#C0C7D0" offset="1"></stop>
      </linearGradient>
      <filter
        color-interpolation-filters="sRGB"
        filterUnits="userSpaceOnUse"
        height="256"
        width="256"
        y="0"
        x="0"
        id="svg-icon-22"
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
          result="effect1_innerShadow_33064_333436"
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
          result="effect1_innerShadow_33064_333436"
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
