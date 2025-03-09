<script setup>
import { defineProps, defineModel } from "vue";

const modelValue = defineModel();

defineProps({
  typeInput: {
    type: String,
    default: "text",
  },
  idInput: {
    type: String,
  },
  placeInput: {
    type: String,
    default: "",
  },
  classInput: {
    type: String,
    default: "px-3 border-gray-300 focus:border-sky-500 focus:ring-sky-200",
  },
});
</script>

<template>
  <input
    :type="typeInput"
    v-model="modelValue"
    :id="idInput"
    :class="`w-full md:h-12 max-md:h-11 rounded-md focus:shadow-sm outline-none border-2 focus:ring-2 duration-300 focus:ring-offset-1 ${classInput}`"
    :placeholder="placeInput"
    v-bind="$attrs"
  />
</template>
