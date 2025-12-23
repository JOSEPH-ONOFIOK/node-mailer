const express = require('express')
const nodemailer = require('nodemailer')
const cors = require('cors')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

/* -------------------- Middleware -------------------- */
const allowedOrigins = [
  'http://localhost:5173',
  'https://portfolio-fr2d.vercel.app',
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('CORS not allowed'))
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}))

app.use(express.json())

/* -------------------- Brevo SMTP -------------------- */
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_KEY,
  },
})

transporter.verify((err) => {
  if (err) {
    console.error('SMTP connection failed:', err)
  } else {
    console.log('Brevo SMTP connected successfully ✅')
  }
})

/* -------------------- Health Check -------------------- */
app.get('/', (_, res) => {
  res.send('Mailer API is running 🚀')
})

/* -------------------- Send Email -------------------- */
app.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.BREVO_FROM}>`,
      to: process.env.RECIPIENT_EMAIL,
      replyTo: email,
      subject: 'New Portfolio Contact Message',
      html: `
        <h2>New Contact Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      `,
    })

    res.status(200).json({ message: 'Email sent successfully' })
  } catch (error) {
    console.error('Email failed:', error)
    res.status(500).json({ error: 'Email failed to send' })
  }
})

/* -------------------- Start Server -------------------- */
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
