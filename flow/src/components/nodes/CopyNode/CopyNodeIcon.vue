<template>
  <svg class="fx-icon" viewBox="0 0 256 256" :width="width" :height="height">
    <g clip-path="url(#svg-icon-47)">
      <path
        fill="url(#svg-icon-54)"
        d="M79.205 163.482 236 25 98.474 146.5c-4.396 1.714-3.962 8.008.593 9.239l-19.862 7.743Z"
      ></path>
      <path
        fill="url(#svg-icon-53)"
        d="M236 25 132.989 175.706l29.337 4.889 54.589 9.098a4.89 4.89 0 0 0 5.429-3.235L236 25Z"
      ></path>
      <path
        fill="url(#svg-icon-52)"
        d="M236 25 79.205 163.482l34.603 55.364c4.521 7.234 13.349 5.371 15.941.835l3.24-43.975L236 25Z"
      ></path>
      <path
        fill="url(#svg-icon-51)"
        d="m162.326 180.595-29.337-4.889-3.24 43.975 32.577-39.086Z"
      ></path>
      <g filter="url(#svg-icon-46)">
        <path
          fill="url(#svg-icon-50)"
          d="M236 25 79.225 163.482l34.602 55.364c4.521 7.234 13.35 5.371 15.942.835l3.24-43.975L236 25Z"
        ></path>
      </g>
      <path
        fill="url(#svg-icon-49)"
        d="M23.52 124.808 236 25 81 166l-56.214-18.96c-10.245-3.455-11.053-17.635-1.267-22.232Z"
      ></path>
      <path
        fill="url(#svg-icon-48)"
        d="M132.5 176.5 236 25.5l-8.729 155.735c-.407 7.274-7.15 12.51-14.298 11.103L132.5 176.5Z"
      ></path>
    </g>
    <defs>
      <linearGradient
        gradientUnits="userSpaceOnUse"
        y2="34.353"
        x2="283.59"
        y1="139.329"
        x1="-2.178"
        id="svg-icon-54"
      >
        <stop stop-color="#089850"></stop>
        <stop stop-color="#A6E8C7" offset="1"></stop>
      </linearGradient>
      <linearGradient
        gradientUnits="userSpaceOnUse"
        y2="34.353"
        x2="283.59"
        y1="139.329"
        x1="-2.178"
        id="svg-icon-53"
      >
        <stop stop-color="#089850"></stop>
        <stop stop-color="#A6E8C7" offset="1"></stop>
      </linearGradient>
      <linearGradient
        gradientUnits="userSpaceOnUse"
        y2="104.959"
        x2="253.754"
        y1="138.579"
        x1="84.136"
        id="svg-icon-52"
      >
        <stop stop-color="#137A46"></stop>
        <stop stop-color="#44C584" offset="1"></stop>
      </linearGradient>
      <linearGradient
        gradientUnits="userSpaceOnUse"
        y2="188.345"
        x2="198.296"
        y1="209.271"
        x1="152.345"
        id="svg-icon-51"
      >
        <stop stop-color="#009280"></stop>
        <stop stop-color="#08453D" offset="1"></stop>
      </linearGradient>
      <linearGradient
        gradientUnits="userSpaceOnUse"
        y2="-252.531"
        x2="89.132"
        y1="195.5"
        x1="147"
        id="svg-icon-50"
      >
        <stop stop-color="#00AA96"></stop>
        <stop stop-color="#4EE2C3" offset="1"></stop>
      </linearGradient>
      <linearGradient
        gradientUnits="userSpaceOnUse"
        y2="72.966"
        x2="168.262"
        y1="239.972"
        x1="51.464"
        id="svg-icon-49"
      >
        <stop stop-color="#00B6A0"></stop>
        <stop stop-color="#4EE2C3" offset="1"></stop>
      </linearGradient>
      <linearGradient
        gradientUnits="userSpaceOnUse"
        y2="57.284"
        x2="73.781"
        y1="225.547"
        x1="236"
        id="svg-icon-48"
      >
        <stop stop-color="#00B6A0"></stop>
        <stop stop-color="#4EE2C3" offset="1"></stop>
      </linearGradient>
      <clipPath id="svg-icon-47">
        <rect
          fill="#fff"
          rx="51.2"
          height="256"
          width="256"
          data-follow-fill="#fff"
        ></rect>
      </clipPath>
      <filter
        color-interpolation-filters="sRGB"
        filterUnits="userSpaceOnUse"
        height="207.758"
        width="160.663"
        y="15.928"
        x="79.225"
        id="svg-icon-46"
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
        <feOffset dy="-9.072" dx="3.888"></feOffset>
        <feGaussianBlur stdDeviation="5.184"></feGaussianBlur>
        <feComposite
          k3="1"
          k2="-1"
          operator="arithmetic"
          in2="hardAlpha"
        ></feComposite>
        <feColorMatrix
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0"
        ></feColorMatrix>
        <feBlend
          result="effect1_innerShadow_33064_333434"
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
