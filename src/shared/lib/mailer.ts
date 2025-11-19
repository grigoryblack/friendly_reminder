import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
  
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Password Reset Request - Friendly Reminder',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password. Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this password reset, please ignore this email.</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, error }
  }
}
