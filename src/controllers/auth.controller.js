import {
  emailVerificationService,
  forgotPasswordService,
  getStatusService,
  loginService,
  logoutService,
  profileService,
  recreateAccountService,
  registerService,
  resendVerificationEmailService,
  resetPasswordService,
} from "../services/auth.service.js";

// REGISTER USER
export const registerController = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const newUser = await registerService(req, firstName, lastName, email, password);

    res.status(201).json({
      status: "Success",
      message: "Registration successfully. Please check your email for verification.",
      pending: true,
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: "Registration error.",
      error: error.message,
    });
  }
};

// RESEND VERIFICATION EMAIL
export const resendVerificationEmailController = async (req, res) => {
  if (!req.session.pendingVerification || req.session.pendingVerification.expires < Date.now()) {
    return res.status(400).json({
      status: "Error",
      message: "Verification session expired. Please resgister again.",
    });
  }
  try {
    const { email } = req.session.pendingVerification;
    await resendVerificationEmailService(req, email);

    res.status(200).json({
      status: "success",
      message: "Verification email resend.",
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: "Error resending verification email.",
      error: error.message,
    });
  }
};

// RECREATE ACCOUNT (hapus user pending dan session)
export const recreateAccountController = async (req, res) => {
  if (!req.session.pendingVerification) {
    return res.status(400).json({
      status: "Error",
      message: "No pending verification session found.",
    });
  }

  try {
    const { userId } = req.session.pendingVerification;
    await recreateAccountService(req, userId);

    res.status(200).json({
      status: "Success",
      message: "Account removed. You can register again.",
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: "Error recreate account.",
      error: error.message,
    });
  }
};

// EMAIL VERIFICATION
export const emailVerificationController = async (req, res) => {
  const { token } = req.query;

  try {
    await emailVerificationService(req, token);

    res.status(200).json({
      status: "Success",
      message: "Email verified successfully.",
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: "Invalid or expired verification token.",
      error: error.message,
    });
  }
};

// LOGIN USER
export const loginController = async (req, res) => {
  const { email, password } = req.body;
  try {
    const accessToken = await loginService(email, password);
    res.status(200).json({
      status: "Success",
      message: "Login successfully.",
      token: accessToken,
    });
  } catch (error) {
    console.error("Login controller error:", error);
    res.status(500).json({
      status: "Error",
      message: "Error login user.",
      error: error.message,
    });
  }
};

// FORGOT PASSWORD
export const forgotPasswordController = async (req, res) => {
  const { email } = req.body;

  try {
    await forgotPasswordService(email);

    res.status(200).json({
      status: "Success",
      message: "Reset password email send.",
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: "Error reset password email send.",
      error: error.message,
    });
  }
};

// RESET PASSWORD
export const resetPasswordController = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    await resetPasswordService(token, newPassword);

    res.status(200).json({
      status: "Success",
      message: "Password reset successfully.",
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: "Invalid or expired reset token.",
      error: error.message,
    });
  }
};

// PROFILE
export const profileController = async (req, res) => {
  const userId = req.user.id;
  try {
    const { user } = await profileService(userId);

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: "Error get user.",
      error: error.message,
    });
  }
};

// STATUS PENDING REGISTER
export const getStatusController = (req, res) => {
  try {
    const status = getStatusService(req);
    res.json(status);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGOUT USER
export const logoutController = async (req, res) => {
  try {
    await logoutService(req);
    res.clearCookie("connect.sid");
    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
