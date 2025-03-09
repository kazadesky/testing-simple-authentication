import { createRouter, createWebHistory } from "vue-router";
import WelcomeView from "@/views/contents/WelcomeView.vue";
import { useAuthenticationStore } from "@/stores/auth.store";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "welcome-view",
      component: WelcomeView,
    },
    {
      path: "/auth",
      redirect: { name: "login-view" },
      component: () => import("@/layouts/AuthLayout.vue"),
      meta: { requiresAuth: false },
      children: [
        {
          path: "login",
          name: "login-view",
          component: () => import("@/views/authentication/LoginView.vue"),
          meta: { title: "Login" },
        },
        {
          path: "register",
          name: "register-view",
          component: () => import("@/views/authentication/RegisterView.vue"),
          meta: { title: "Register" },
        },
        {
          path: "verification-email",
          name: "verification-email-view",
          component: () => import("@/views/authentication/VerificationEmailView.vue"),
          meta: { title: "Verification Email" },
        },
        {
          path: "email-verified/:token",
          name: "email-verified-view",
          component: () => import("@/views/authentication/EmailVerifyView.vue"),
          meta: { title: "Email Verified" },
        },
        {
          path: "forgot-password",
          name: "forgot-password-view",
          component: () => import("@/views/authentication/ForgotPasswordView.vue"),
          meta: { title: "Forgot Password" },
        },
        {
          path: "reset-password/:token",
          name: "reset-password-view",
          component: () => import("@/views/authentication/ResetPasswordView.vue"),
          meta: { title: "Reset Password" },
        },
      ],
    },
    {
      path: "/dashboard",
      name: "dashboard-view",
      component: () => import("@/views/contents/DashboardView.vue"),
      meta: { title: "Dashboard", requiresAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found-view",
      component: () => import("@/views/response/404View.vue"),
      meta: { title: "Not Found", requiresAuth: false },
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - Testing Authentication` : "Testing Authentication";

  const authStore = useAuthenticationStore();
  const isAuthenticated = authStore.isAuthenticated();

  // 🔹 Jika user sudah login dan ingin ke login/register, redirect ke dashboard
  if (isAuthenticated && (to.name === "login-view" || to.name === "register-view")) {
    return next({ name: "dashboard-view" });
  }

  // 🔹 Jika user belum login dan halaman membutuhkan autentikasi, redirect ke login
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: "login-view" });
  }

  // Jika user mengakses halaman register, periksa status pending verifikasi melalui endpoint status
  if (to.name === "register-view") {
    const status = await authStore.checkStatus();
    if (status.pending) {
      // Redirect ke halaman verifikasi email jika masih pending
      return next({ name: "verification-email-view" });
    }
  }

  // 🔹 Ambil profil user jika belum ada di store
  if (isAuthenticated && !authStore.user) {
    try {
      await authStore.fetchProfile();
    } catch (error) {
      console.error("Gagal memuat profil pengguna:", error);
      return next({ name: "login-view" });
    }
  }

  next();
});

export default router;
