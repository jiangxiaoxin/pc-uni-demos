<template>
  <svg class="fx-icon" viewBox="0 0 256 256" :width="width" :height="height">
    <g filter="url(#svg-icon-17)">
      <circle
        fill="url(#svg-icon-18)"
        r="103.68"
        cy="131.255"
        cx="128.731"
      ></circle>
      <path
        fill="#fff"
        d="M99.132 101.1c0-9.238 10-15.012 18-10.393l51.48 29.722c8 4.619 8 16.166 0 20.785l-51.48 29.722c-8 4.619-18-1.155-18-10.393V101.1Z"
        data-follow-fill="#fff"
      ></path>
    </g>
    <defs>
      <linearGradient
        gradientUnits="userSpaceOnUse"
        y2="27.575"
        x2="25.051"
        y1="208.5"
        x1="166.301"
        id="svg-icon-18"
      >
        <stop stop-color="#3BAD4A"></stop>
        <stop stop-color="#64C871" offset="1"></stop>
      </linearGradient>
      <filter
        color-interpolation-filters="sRGB"
        filterUnits="userSpaceOnUse"
        height="256"
        width="256"
        y="0"
        x="0"
        id="svg-icon-17"
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
          result="effect1_innerShadow_33064_333433"
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
          result="effect1_innerShadow_33064_333433"
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
