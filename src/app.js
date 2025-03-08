import express from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import dotenv from 'dotenv'
import router from './router/index.js'
dotenv.config()

const app = express()
const PORT = process.env.PORT

app.use(express.json())
app.use(cookieParser())
app.use(morgan("dev"))

// Konfigurasi session untuk menyimpan status pending verifikasi
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 // contoh: 1 jam
    }
}))

app.use('/auth', router)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})