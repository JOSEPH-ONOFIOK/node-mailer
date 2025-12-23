const express = require('express')
const nodemailer = require('nodemailer')
const cors = require('cors')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

/* -------------------- Middleware -------------------- */
const allowedOrigins = [
  'http://localhost:5173',           // Vite dev server
  'https://portfolio-fr2d.vercel.app' // Deployed frontend
]

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true) // allow Postman/cURL
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    } else {
      return callback(new Error(`CORS error: Origin ${origin} not allowed`), false)
    }
  },
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}))

app.options('*', cors())
app.use(express.json())

/* -------------------- Nodemailer Transport -------------------- */
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,           // Use 587 (TLS)
  secure: false,       // false for STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
})

/* -------------------- Health Check -------------------- */
app.get('/', (req, res) => {
  res.send('Mailer API is running 🚀')
})

/* -------------------- Contact Form Endpoint -------------------- */
app.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body
  console.log('Incoming request body:', req.body)

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' })
  }

  const mailOptions = {
    from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.RECIPIENT_EMAIL,
    replyTo: email,
    subject: 'New Portfolio Contact Message',
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.response)
    res.status(200).json({ message: 'Email sent successfully' })
  } catch (error) {
    console.error('Email sending failed:', error)
    res.status(500).json({
      error: 'Failed to send email',
      details: error.message,
    })
  }
})

/* -------------------- Start Server -------------------- */
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
