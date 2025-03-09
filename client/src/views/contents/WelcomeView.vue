<script setup>
import { useRouter } from "vue-router";
import { onMounted } from "vue";

const router = useRouter();
const redirectDelay = 3000; // ⏳ Delay sebelum redirect (ms)

onMounted(() => {
  setTimeout(() => {
    router.push({ name: "login-view" });
  }, redirectDelay);
});
</script>

<template>
  <div class="w-full h-screen flex items-center justify-center bg-gray-100">
    <h1 class="text-2xl font-bold uppercase flex items-center space-x-2">
      <span class="size-6 bg-blue-500 rounded-full animate-pulse"></span>
      <span class="text-gray-800">Testing Authentication</span>
    </h1>
  </div>
</template>
