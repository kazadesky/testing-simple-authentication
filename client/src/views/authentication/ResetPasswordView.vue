<script setup>
import LabelComponent from "@/components/LabelComponent.vue";
import InputComponent from "@/components/InputComponent.vue";
import { OhVueIcon, addIcons } from "oh-vue-icons";
import { BiEye, BiEyeSlash } from "oh-vue-icons/icons";
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthenticationStore } from "@/stores/auth.store";

addIcons(BiEye, BiEyeSlash);

const authStore = useAuthenticationStore();
const router = useRouter();
const route = useRoute();

const newPassword = ref("");
const isLoading = ref(false);
const messageError = ref("");

// Ambil token dari parameter route
const resetToken = route.params.token || "";

const resetPassword = async () => {
  isLoading.value = true;
  messageError.value = "";
  try {
    await authStore.resetPassword(resetToken, newPassword.value);
    // Jika ada pesan sukses, bisa tampilkan notifikasi, lalu redirect ke login
    if (authStore.resetPasswordMessage) {
      messageError.value = authStore.resetPasswordMessage;
      setTimeout(() => router.push({ name: "login-view" }), 2000);
    } else if (authStore.resetPasswordError) {
      messageError.value = authStore.resetPasswordError;
    }
  } catch (error) {
    console.error(error.message);
    messageError.value = authStore.resetPasswordError;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (!resetToken) {
    messageError.value = "No reset token provided.";
  }
});
</script>

<template>
  <div class="relative max-w-sm w-full flex flex-col items-center space-y-3">
    <section class="w-full flex flex-col mb-3 space-y-1 items-center justify-center">
      <h1 class="font-bold uppercase md:text-2xl max-md:text-lg">Reset Password</h1>
      <p class="text-center text-gray-600 text-sm">Enter your new password.</p>
    </section>

    <section
      v-if="messageError"
      :class="[
        'w-full h-11 flex items-center px-3 rounded-r-md border-l-4',
        authStore.resetPasswordMessage ? 'bg-green-100 border-green-600 text-green-600' : '',
        authStore.resetPasswordError ? 'bg-red-100 border-red-600 text-red-600' : '',
      ]"
    >
      <p class="text-sm">{{ messageError }}</p>
    </section>

    <form
      @submit.prevent="resetPassword"
      class="w-full bg-white shadow-lg md:rounded-lg max-md:rounded-md md:p-5 max-md:p-3 border-2 border-gray-100"
    >
      <section class="mb-3 w-full">
        <label-component for-label="password" text-label="New Password" />
        <div class="relative w-full">
          <input-component
            :type-input="authStore.showPassword ? 'text' : 'password'"
            v-model="newPassword"
            id-input="password"
            place-input="******"
          />
          <button
            type="button"
            @click.prevent="authStore.togglePassword"
            class="absolute md:top-3 md:right-3 max-md:top-0 max-md:right-0 active:text-sky-600 active:scale-95 cursor-pointer outline-none focus:text-sky-500 hover:text-sky-500 transition-colors duration-300 text-gray-600"
          >
            <OhVueIcon :name="authStore.showPassword ? 'bi-eye-slash' : 'bi-eye'" scale="1.3" />
          </button>
        </div>
      </section>

      <section class="w-full flex items-center">
        <button
          type="submit"
          :class="`w-full md:h-10 max-md:h-9 rounded-md shadow-sm outline-none font-medium uppercase text-white transition duration-300 active:scale-95 cursor-pointer ${!isLoading ? 'bg-sky-600 hover:bg-sky-700 focus:ring-2 focus:ring-sky-300 focus:ring-offset-1' : 'bg-gray-500 cursor-not-allowed'}`"
          :disabled="isLoading"
        >
          {{ isLoading ? "Loading..." : "Reset" }}
        </button>
      </section>
    </form>
  </div>
</template>
