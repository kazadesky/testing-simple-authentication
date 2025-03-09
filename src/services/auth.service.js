import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";
dotenv.config();

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// REGISTER USER
export const registerService = async (req, firstName, lastName, email, password) => {
  try {
    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({ where: { email: email } });
    if (existingUser) {
      throw new Error("Email already registered.");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.PASSWORD_ROUND));

    // Buat token verifikasi (JWT) dengan payload minimal email
    const verificationToken = jwt.sign({ email }, process.env.EMAIL_VERIFICATION_SECRET, {
      expiresIn: process.env.EMAIL_VERIFICATION_EXPIRES_IN,
    });

    // Buat user baru dengan isVerified false
    const user = await prisma.user.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
        isVerified: false,
      },
    });

    // Simpan info pending verifikasi di session
    req.session.pendingVerification = {
      userId: user.id,
      email: user.email,
      token: verificationToken,
      // Simpan waktu expired, misal 24 jam ke depan
      expires: Date.now() + 24 * 60 * 60 * 1000,
    };

    // Kirim email verifikasi
    const verifyURL = `http://localhost:8080/auth/email-verified/${verificationToken}`;
    const mailOption = {
      from: "testing.authentication@example.com",
      to: user.email,
      subject: "Verify Your Email",
      html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="color: #333;">Welcome, ${firstName}!</h2>
              <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
              <a href="${verifyURL}" style="display: inline-block; background-color: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
              <p>If the button above does not work, you can also click this link: <br> <a href="${verifyURL}">${verifyURL}</a></p>
              <p>Best regards, <br> Your Support Team</p>
            </div>
          `,
    };
    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        throw new Error(`Error sending verification email: ${error.message}`);
      } else {
        console.log("Verification email sent:", info.response);
      }
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isVerified: user.isVerified,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// RESEND VERIFICATION EMAIL
// RESEND VERIFICATION EMAIL
export const resendVerificationEmailService = async (req, email) => {
  try {
    // Buat token verifikasi baru
    const newVerificationToken = jwt.sign({ email }, process.env.EMAIL_VERIFICATION_SECRET, {
      expiresIn: process.env.EMAIL_VERIFICATION_EXPIRES_IN,
    });

    // Update session pending
    req.session.pendingVerification.token = newVerificationToken;
    req.session.pendingVerification.expires = Date.now() + 24 * 60 * 60 * 1000;

    // Kirim email verifikasi ulang
    const verifyURL = `http://localhost:8080/auth/email-verified/${newVerificationToken}`;
    const mailOption = {
      from: "testing.authentication@example.com",
      to: email, // Pastikan email terdefinisi
      subject: "Resend: Verify Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #333;">Welcome!</h2>
          <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
          <a href="${verifyURL}" style="display: inline-block; background-color: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p>If the button above does not work, you can also click this link:<br> <a href="${verifyURL}">${verifyURL}</a></p>
          <p>Best regards,<br> Your Support Team</p>
        </div>
      `,
    };

    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        throw new Error(`Error sending verification email: ${error.message}`);
      } else {
        console.log("Verification email sent:", info.response);
      }
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

// RECREATE ACCOUNT
export const recreateAccountService = async (req, userId) => {
  try {
    // Hapus user dari databse
    await prisma.user.delete({ where: { id: userId } });
    delete req.session.pendingVerification;
  } catch (error) {
    throw new Error(error.message);
  }
};

// EMAIL VERIFICATION
export const emailVerificationService = async (req, token) => {
  try {
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);

    // Cari user berdasarkan email dari token
    const user = await prisma.user.findUnique({ where: { email: decoded.email } });
    if (!user) {
      throw new Error("User not found.");
    }
    if (user.isVerified) {
      throw new Error("Email already verified.");
    }

    // Update user menjadi verified
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    // Hapus session pending jika ada
    delete req.session.pendingVerification;
  } catch (error) {
    throw new Error(error.message);
  }
};

// LOGIN USER
export const loginService = async (email, password) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: email } });
    if (!user) {
      throw new Error("User not found.");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error("Invalid credentials.");
    }
    if (!user.isVerified) {
      throw new Error("User email is not verified.");
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, firstName: user.firstName },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return accessToken;
  } catch (error) {
    console.error("Login service error:", error);
    throw new Error(error.message);
  }
};

// FORGOT PASSWORD
export const forgotPasswordService = async (email) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("Email not found");
    }

    // Buat token reset password
    const resetToken = jwt.sign({ email }, process.env.RESET_PASSWORD_SECRET, {
      expiresIn: process.env.RESET_PASSWORD_EXPIRES_IN,
    });

    // (Opsional) Simpan token reset di database untuk pencatatan
    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: resetToken },
    });

    // Kirim email reset password
    const resetURL = `http://localhost:8080/auth/reset-password/${resetToken}`;
    const mailOption = {
      from: "testing.authentication@example.com",
      to: user.email, // Pastikan email penerima valid
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #333;">Hello, ${user.firstName}</h2>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <a href="${resetURL}" style="display: inline-block; background-color: #dc3545; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>If you did not request this, please ignore this email.</p>
          <p>Best regards,<br>Your Support Team</p>
        </div>
      `,
    };

    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        throw new Error(`Reset email error: ${error.message}`);
      } else {
        console.log(`Reset password email sent: ${info.response}`);
      }
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

// RESET PASSWORD
export const resetPasswordService = async (token, newPassword) => {
  try {
    const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
    const user = await prisma.user.findUnique({ where: { email: decoded.email } });
    if (!user) {
      throw new Error("User not found.");
    }
    // (Optional) Periksa token reset di database jika diperlukan
    if (user.resetPasswordToken !== token) {
      throw new Error("Invalid or expired reset token");
    }

    // Hash password baru dan perbaharui user
    const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.PASSWORD_ROUND));
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

// PROFILE
export const profileService = async (userId) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return { user };
  } catch (error) {
    throw new Error(error.message);
  }
};

// STATUS PENDING REGISTER
export const getStatusService = (req) => {
  if (req.session.pendingVerification && req.session.pendingVerification.expires > Date.now()) {
    return {
      pending: true,
      pendingData: req.session.pendingVerification,
    };
  }
  return { pending: false };
};

// LOGOUT USER
export const logoutService = (req) => {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) reject(new Error("Logout failed"));
      else resolve();
    });
  });
};
