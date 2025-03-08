import e from "express";
import { checkPendingVerification, requireAuth } from "../middlewares/auth.middleware.js";
import { emailVerificationController, forgotPasswordController, loginController, profileController, recreateAccountController, registerController, resendVerificationEmailController, resetPasswordController } from "../controllers/auth.controller.js";

const router = e.Router()

router.post('/register', checkPendingVerification, registerController)
router.post('/resend-verification', resendVerificationEmailController)
router.post('/recreate-account', recreateAccountController)
router.post('/verify-email', emailVerificationController)
router.post('/login', loginController)
router.post('/forgot-password', forgotPasswordController)
router.post('/reset-password', resetPasswordController)
router.get('/profile', requireAuth, profileController)

export default router