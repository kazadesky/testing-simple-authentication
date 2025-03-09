<script setup>
import { ref } from "vue";
import { useAuthenticationStore } from "@/stores/auth.store";
import { useRouter } from "vue-router";

const authStore = useAuthenticationStore();
const router = useRouter();
const isLoadingResend = ref(false);
const messageInfo = ref("");
const messageError = ref("");

const resendEmail = async () => {
  messageError.value = "";
  messageInfo.value = "";
  isLoadingResend.value = true;
  try {
    const response = await authStore.resendVerification();
    messageInfo.value = response.message || "Verification email resent. Please check your email.";
  } catch (error) {
    messageError.value = error.response?.data?.message || "Error resending verification email.";
  } finally {
    isLoadingResend.value = false;
  }
};

const recreateAccount = async () => {
  messageError.value = "";
  messageInfo.value = "";
  isLoadingResend.value = true;
  try {
    const response = await authStore.recreateAccount();
    messageInfo.value = response.message || "Account removed. You can register again.";
    // Redirect ke halaman register jika diperlukan
    router.push({ name: "register-view" });
  } catch (error) {
    messageError.value = error.response?.data?.message || "Error recreating account.";
  } finally {
    isLoadingResend.value = false;
  }
};
</script>

<template>
  <div class="max-w-md mx-auto p-4">
    <h1 class="text-xl font-bold mb-4">Email Verification</h1>
    <p class="mb-4">
      A verification email has been sent to <strong>{{ authStore.pendingVerification?.email }}</strong
      >. Please check your inbox (or spam folder) and click the verification link.
    </p>

    <div v-if="messageInfo" class="mb-4 p-2 bg-green-100 text-green-700 rounded">
      {{ messageInfo }}
    </div>
    <div v-if="messageError" class="mb-4 p-2 bg-red-100 text-red-700 rounded">
      {{ messageError }}
    </div>

    <button
      @click="resendEmail"
      :disabled="isLoadingResend"
      class="w-full py-2 mb-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
    >
      {{ isLoadingResend ? "Resending..." : "Resend Verification Email" }}
    </button>

    <button
      @click="recreateAccount"
      :disabled="isLoadingResend"
      class="w-full py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
    >
      {{ isLoadingResend ? "Processing..." : "Recreate Account" }}
    </button>
  </div>
</template>
