<script setup>
import LabelComponent from "@/components/LabelComponent.vue";
import InputComponent from "@/components/InputComponent.vue";
import { reactive, ref } from "vue";
import { OhVueIcon, addIcons } from "oh-vue-icons";
import { BiEye, BiEyeSlash } from "oh-vue-icons/icons";
import { useAuthenticationStore } from "@/stores/auth.store";
import { useRouter } from "vue-router";

addIcons(BiEye, BiEyeSlash);

const router = useRouter();
const authStore = useAuthenticationStore();
const fields = reactive({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
});
const messageError = ref("");
const isLoading = ref(false);

const register = async () => {
  messageError.value = "";
  isLoading.value = true;

  try {
    await authStore.register({
      firstName: fields.firstName,
      lastName: fields.lastName,
      email: fields.email,
      password: fields.password,
    });
    router.push({ name: "verification-email-view" });
  } catch (error) {
    console.error(error.message);
    messageError.value = error.response?.data?.message || "Register Error";
  } finally {
    messageError.value = "";
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="relative max-w-sm w-full flex flex-col items-center space-y-3">
    <section class="w-full flex flex-col mb-3 space-y-1 items-center justify-center">
      <h1 class="font-bold uppercase md:text-2xl max-md:text-lg">Register</h1>
      <p class="text-center text-gray-600 text-sm">Lorem, ipsum dolor sit amet consectetur adipisicing elit.</p>
    </section>

    <form
      @submit.prevent="register"
      class="w-full bg-white shadow-lg md:rounded-lg max-md:rounded-md md:p-5 max-md:p-3 border-2 border-gray-100"
    >
      <section class="md:mb-4 max-md:mb-3 w-full">
        <label-component for-label="firstName" text-label="First Name" />
        <input-component type-input="text" v-model="fields.firstName" id-input="firstName" place-input="First Name" />
      </section>

      <section class="md:mb-4 max-md:mb-3 w-full">
        <label-component for-label="lastName" class-label="" text-label="Last Name" />
        <input-component type-input="text" v-model="fields.lastName" id-input="lastName" place-input="Last Name" />
      </section>

      <section class="md:mb-4 max-md:mb-3 w-full">
        <label-component for-label="email" text-label="Email" />
        <input-component
          type-input="email"
          v-model="fields.email"
          id-input="email"
          place-input="E.g email@example.com"
        />
      </section>

      <section class="md:mb-4 max-md:mb-3 w-full">
        <label-component for-label="password" text-label="Password" />
        <div class="relative w-full">
          <input-component
            :type-input="authStore.showPassword ? 'text' : 'password'"
            v-model="fields.password"
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

      <section class="w-full flex flex-col space-y-3 items-center">
        <button
          type="submit"
          :class="`w-full md:h-10 max-md:h-9 rounded-md shadow-sm outline-none font-medium uppercase text-white transition-discrete duration-300 active:scale-95 cursor-pointer ${!isLoading ? 'bg-sky-600 hover:bg-sky-700 md:focus:bg-sky-700 hover:ring-2 hover:ring-sky-300 hover:ring-offset-1 focus:md:ring-2 focus:md:ring-sky-300 focus:md:ring-offset-1' : 'bg-gray-500'}`"
          :disabled="isLoading"
        >
          {{ isLoading ? "Loading..." : "Register" }}
        </button>
        <p class="text-center">
          Already have an account?
          <router-link
            :to="{ name: 'login-view' }"
            class="text-sky-600 outline-none hover:underline hover:underline-offset-4"
            >login.</router-link
          >
        </p>
      </section>
    </form>
  </div>
</template>
