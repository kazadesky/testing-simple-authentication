<script setup>
import { useAuthenticationStore } from "@/stores/auth.store";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const authStore = useAuthenticationStore();
// Pinia secara otomatis meng-unref properti yang dikembalikan dari store, jadi dapat langsung dipakai di template
const user = authStore.user;
const isLoading = ref(false);
const router = useRouter();

const logout = async () => {
  isLoading.value = true;
  try {
    await authStore.logout();
    router.push({ name: "login-view" });
  } catch (error) {
    console.error(error.message);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  try {
    await authStore.fetchProfile();
  } catch (error) {
    console.error(error.message);
  }
});
</script>

<template>
  <ul class="w-full list-disc md:p-24 max-md:p-10 flex flex-col space-y-3">
    <span class="font-medium text-gray-700 uppercase text-sm">Profile User :</span>
    <li>Nama Depan : {{ user.firstName }}</li>
    <li>Nama Belakang : {{ user.lastName }}</li>
    <li>Email Pengguna : {{ user.email }}</li>
    <button
      type="button"
      @click.prevent="logout"
      :class="`outline-none px-5 py-2 font-medium text-white uppercase rounded-md shadow-sm active:scale-95 cursor-pointer ${!isLoading ? 'bg-red-600 hover:bg-red-700 hover:ring-2 hover:ring-red-400 hover:ring-offset-1' : 'bg-gray-500 disabled:cursor-progress'}`"
      :disabled="isLoading"
    >
      {{ isLoading ? "Loading..." : "Logout" }}
    </button>
  </ul>
</template>
