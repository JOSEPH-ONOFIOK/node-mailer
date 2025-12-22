const express = require('express')
const nodemailer = require('nodemailer')
const cors = require('cors')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

/* -------------------- Middleware -------------------- */
app.use(cors())
app.use(express.json())

/* -------------------- Nodemailer Transport -------------------- */
const transporter = nodemailer.createTransport({
  service: 'gmail',
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

  if (!name || !email || !message) {
    return res.status(400).json({
      error: 'Name, email, and message are required',
    })
  }

  const mailOptions = {
    from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.RECIPIENT_EMAIL,
    replyTo: email,
    subject: 'New Portfolio Contact Message',
    text: `
Name: ${name}
Email: ${email}

Message:
${message}
    `,
    html: `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return res.status(200).json({ message: 'Email sent successfully' })
  } catch (error) {
    console.error('Email error:', error)
    return res.status(500).json({ error: 'Failed to send email' })
  }
})

/* -------------------- Start Server -------------------- */
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
