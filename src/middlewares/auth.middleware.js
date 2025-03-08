import jwt, { decode } from "jsonwebtoken"
import dotenv from 'dotenv'
dotenv.config()

// Middleware untuk route yang memeriksa pending verifikasi
// Jika ada session pending verifikasi yang belum expired, user diarahkan ke halaman notifikasi.
export const checkPendingVerification = (req, res, next) => {
    if (req.session.pendingVerification && req.session.pendingVerification.expires > Date.now()) {
        return res.status(403).json({
            message: "A verification email has already been sent. Please verify your account or resend verification email.",
            pending: true,
            pendingData: req.session.pendingVerification
        })
    }
    next()
}

// Middleware untuk melindungi route yang memerlukan autentikasi (JWT)
export const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Invalid token" });
        req.user = decoded
        next()
    })
}