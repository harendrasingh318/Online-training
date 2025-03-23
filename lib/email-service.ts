import nodemailer from "nodemailer"

// In production, use a real email service like SendGrid, Mailgun, etc.
// For development, we can use a test account or console logging
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.ethereal.email",
  port: Number.parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"OurSkillLab" <noreply@ourskilllab.com>',
      to,
      subject,
      html,
    })

    console.log("Email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

export function generateReceiptEmail({
  userName,
  courseName,
  amount,
  date,
  transactionId,
  discountApplied = 0,
}: {
  userName: string
  courseName: string
  amount: number
  date: Date
  transactionId: string
  discountApplied?: number
}) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
        .content { padding: 20px 0; }
        .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; font-size: 12px; color: #777; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
        th { font-weight: bold; }
        .total { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Receipt</h1>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>Thank you for your purchase. Your payment has been successfully processed.</p>
          
          <h2>Receipt Details</h2>
          <table>
            <tr>
              <th>Item</th>
              <td>${courseName}</td>
            </tr>
            <tr>
              <th>Date</th>
              <td>${formattedDate}</td>
            </tr>
            <tr>
              <th>Transaction ID</th>
              <td>${transactionId}</td>
            </tr>
            ${
              discountApplied > 0
                ? `
            <tr>
              <th>Original Price</th>
              <td>$${(amount + discountApplied).toFixed(2)}</td>
            </tr>
            <tr>
              <th>Discount Applied</th>
              <td>-$${discountApplied.toFixed(2)}</td>
            </tr>
            `
                : ""
            }
            <tr class="total">
              <th>Total Paid</th>
              <td>$${amount.toFixed(2)}</td>
            </tr>
          </table>
          
          <p>You can access your course by logging into your account and visiting the "My Courses" section of your dashboard.</p>
          
          <p>If you have any questions or need assistance, please contact our support team.</p>
          
          <p>Best regards,<br>The OurSkillLab Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} OurSkillLab. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

