<script setup>
import LabelComponent from "@/components/LabelComponent.vue";
import InputComponent from "@/components/InputComponent.vue";
import { OhVueIcon, addIcons } from "oh-vue-icons";
import { MdEmailOutlined } from "oh-vue-icons/icons";
import { ref } from "vue";
import { useAuthenticationStore } from "@/stores/auth.store";

addIcons(MdEmailOutlined);

const authStore = useAuthenticationStore();
const email = ref("");
const isLoading = ref(false);
const messageError = ref(""); // Menyimpan pesan notifikasi (sukses/error)

const forgotPassword = async () => {
  isLoading.value = true;
  messageError.value = "";

  try {
    await authStore.forgotPassword({ email: email.value });
    // Jika ada pesan sukses dari store, gunakan sebagai notifikasi
    if (authStore.forgotPasswordMessage) {
      messageError.value = authStore.forgotPasswordMessage;
    } else if (authStore.forgotPasswordError) {
      messageError.value = authStore.forgotPasswordError;
    }
  } catch (error) {
    console.error(error.message);
    messageError.value = authStore.forgotPasswordError;
  } finally {
    isLoading.value = false;
    // Jangan reset messageError agar notifikasi tetap terlihat
  }
};
</script>

<template>
  <div class="relative max-w-sm w-full flex flex-col items-center space-y-3">
    <section class="w-full flex flex-col mb-3 space-y-1 items-center justify-center">
      <h1 class="font-bold uppercase md:text-2xl max-md:text-lg">Forgot Password</h1>
      <p class="text-center text-gray-600 text-sm">Enter your email to receive a password reset link.</p>
    </section>

    <!-- Notifikasi: hanya tampil jika messageError memiliki isi -->
    <section
      v-if="messageError"
      :class="[
        'w-full h-11 flex items-center px-3 rounded-r-md border-l-4',
        authStore.forgotPasswordMessage ? 'bg-green-100 border-green-600 text-green-600' : '',
        authStore.forgotPasswordError ? 'bg-red-100 border-red-600 text-red-600' : '',
      ]"
    >
      <p class="text-sm">{{ messageError }}</p>
    </section>

    <form
      @submit.prevent="forgotPassword"
      class="w-full bg-white shadow-lg md:rounded-lg max-md:rounded-md md:p-5 max-md:p-3 border-2 border-gray-100"
    >
      <section class="md:mb-4 max-md:mb-3 w-full">
        <label-component for-label="email" text-label="Email" />
        <div class="relative w-full">
          <input-component type-input="email" v-model="email" id-input="email" place-input="E.g email@example.com" />
          <label for="email" class="absolute md:top-3 md:right-3 max-md:top-0 max-md:right-0 text-gray-500">
            <OhVueIcon name="md-email-outlined" scale="1.3" />
          </label>
        </div>
      </section>

      <section class="w-full flex flex-col space-y-3 items-center">
        <button
          type="submit"
          :class="`w-full md:h-10 max-md:h-9 rounded-md shadow-sm outline-none font-medium uppercase text-white transition duration-300 active:scale-95 cursor-pointer ${
            !isLoading
              ? 'bg-sky-600 hover:bg-sky-700 focus:ring-2 focus:ring-sky-300 focus:ring-offset-1'
              : 'bg-gray-500 cursor-not-allowed'
          }`"
          :disabled="isLoading"
        >
          {{ isLoading ? "Loading..." : "Submit" }}
        </button>
        <p class="text-center">
          <router-link
            :to="{ name: 'login-view' }"
            class="text-sky-600 outline-none hover:underline hover:underline-offset-4"
          >
            Return to login.
          </router-link>
        </p>
      </section>
    </form>
  </div>
</template>
