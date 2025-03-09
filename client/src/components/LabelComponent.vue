<script setup>
import { defineProps } from "vue";

defineProps({
  forLabel: {
    type: String,
    required: true,
  },
  textLabel: {
    type: String,
    required: true,
  },
  classLabel: {
    type: String,
    default: "after:ml-0.5 after:text-red-500 after:content-['*']",
  },
});
</script>

<template>
  <label :for="forLabel" :class="`text-sm font-medium text-gray-700 md:mb-1 ${classLabel}`">{{ textLabel }}</label>
</template>
