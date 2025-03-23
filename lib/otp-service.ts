import { randomInt } from "crypto"

// In-memory OTP storage (in production, use Redis or similar)
const otpStore: Record<string, { otp: string; expires: number }> = {}

export function generateOTP(identifier: string): string {
  // Generate a 6-digit OTP
  const otp = randomInt(100000, 999999).toString()

  // Store OTP with 10-minute expiry
  otpStore[identifier] = {
    otp,
    expires: Date.now() + 10 * 60 * 1000,
  }

  return otp
}

export function verifyOTP(identifier: string, otp: string): boolean {
  const storedData = otpStore[identifier]

  if (!storedData) {
    return false
  }

  if (Date.now() > storedData.expires) {
    // OTP expired
    delete otpStore[identifier]
    return false
  }

  if (storedData.otp !== otp) {
    return false
  }

  // OTP verified successfully, remove it
  delete otpStore[identifier]
  return true
}

// Mock function to send SMS (in production, use a real SMS service)
export async function sendSMSOTP(mobile: string, otp: string): Promise<boolean> {
  console.log(`Sending OTP ${otp} to mobile ${mobile}`)
  // In production, integrate with SMS service like Twilio
  return true
}

// Mock function to send Email (in production, use a real email service)
export async function sendEmailOTP(email: string, otp: string): Promise<boolean> {
  console.log(`Sending OTP ${email} to email ${email}`)
  // In production, integrate with email service like SendGrid
  return true
}

