<script setup>
import { useAuthenticationStore } from "@/stores/auth.store";
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const authStore = useAuthenticationStore();
const token = route.params.token;

onMounted(async () => {
  try {
    await authStore.emailVerified(token);
  } catch (error) {
    console.error(error.message);
  }
});
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="bg-white shadow-lg rounded-lg p-8 max-w-md text-center">
      <div class="flex justify-center">
        <svg
          class="w-20 h-20 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2l4-4m6 2a9 9 0 11-18 0a9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h1 class="text-2xl font-bold text-gray-800 mt-4">Email Verified Successfully!</h1>

      <p class="text-gray-600 mt-2">
        Thank you for verifying your email address. You can now enjoy all the features of our application.
      </p>

      <button
        @click.prevent="router.push({ name: 'login-view' })"
        class="outline-none mt-6 bg-sky-600 hover:bg-sky-700 active:scale-95 hover:ring-2 hover:ring-sky-400 hover:ring-offset-1 focus:md:ring-2 focus:md:ring-sky-400 focus:md:ring-offset-1 text-white font-semibold py-2 px-4 rounded-md"
      >
        Go to Login
      </button>
    </div>
  </div>
</template>
