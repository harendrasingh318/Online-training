"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import connectDB from "@/lib/db"
import User from "@/lib/models/user"
import { generateOTP, verifyOTP, sendSMSOTP, sendEmailOTP } from "@/lib/otp-service"
import { hash } from "bcryptjs" // Changed from bcrypt to bcryptjs

export async function requestMobileOTP(formData: FormData) {
  const mobile = formData.get("mobile") as string

  if (!mobile) {
    return { success: false, message: "Mobile number is required" }
  }

  await connectDB()

  // Check if user exists
  const user = await User.findOne({ mobile })

  if (!user) {
    return { success: false, message: "User not found" }
  }

  const otp = generateOTP(mobile)
  await sendSMSOTP(mobile, otp)

  return { success: true, message: "OTP sent to your mobile number" }
}

export async function requestEmailOTP(formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    return { success: false, message: "Email is required" }
  }

  await connectDB()

  // Check if user exists
  const user = await User.findOne({ email })

  if (!user) {
    return { success: false, message: "User not found" }
  }

  const otp = generateOTP(email)
  await sendEmailOTP(email, otp)

  return { success: true, message: "OTP sent to your email" }
}

export async function verifyMobileOTPAndLogin(formData: FormData) {
  const mobile = formData.get("mobile") as string
  const otp = formData.get("otp") as string

  if (!mobile || !otp) {
    return { success: false, message: "Mobile number and OTP are required" }
  }

  const isValid = verifyOTP(mobile, otp)

  if (!isValid) {
    return { success: false, message: "Invalid or expired OTP" }
  }

  await connectDB()

  const user = await User.findOne({ mobile })

  if (!user) {
    return { success: false, message: "User not found" }
  }

  // Set session cookie
  // In a real app, use proper session management
  cookies().set("user_id", user._id.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  return { success: true, message: "Login successful", userId: user._id.toString() }
}

export async function verifyEmailOTPAndLogin(formData: FormData) {
  const email = formData.get("email") as string
  const otp = formData.get("otp") as string

  if (!email || !otp) {
    return { success: false, message: "Email and OTP are required" }
  }

  const isValid = verifyOTP(email, otp)

  if (!isValid) {
    return { success: false, message: "Invalid or expired OTP" }
  }

  await connectDB()

  const user = await User.findOne({ email })

  if (!user) {
    return { success: false, message: "User not found" }
  }

  // Set session cookie
  cookies().set("user_id", user._id.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  return { success: true, message: "Login successful", userId: user._id.toString() }
}

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const mobile = formData.get("mobile") as string
  const password = formData.get("password") as string

  if (!name || !email || !mobile || !password) {
    return { success: false, message: "All fields are required" }
  }

  await connectDB()

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { mobile }],
  })

  if (existingUser) {
    return { success: false, message: "User with this email or mobile already exists" }
  }

  // Create new user
  const hashedPassword = await hash(password, 12)
  const user = new User({
    name,
    email,
    mobile,
    password: hashedPassword,
    role: "user",
  })

  await user.save()

  return { success: true, message: "Registration successful. Please login." }
}

export async function logoutUser() {
  cookies().delete("user_id")
  redirect("/auth/signin")
}

