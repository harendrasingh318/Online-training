"use server"

import { revalidatePath } from "next/cache"
import connectDB from "@/lib/db"
import User from "@/lib/models/user"
import Enrollment from "@/lib/models/enrollment"
import Discount from "@/lib/models/discount"
import { cookies } from "next/headers"

export async function isAdmin() {
  const userId = cookies().get("user_id")?.value

  if (!userId) {
    return false
  }

  await connectDB()

  const user = await User.findById(userId)

  return user?.role === "admin"
}

export async function getEnrollmentReports() {
  const userId = cookies().get("user_id")?.value

  if (!userId) {
    return { success: false, message: "Not authenticated" }
  }

  await connectDB()

  const user = await User.findById(userId)

  if (!user || user.role !== "admin") {
    return { success: false, message: "Not authorized" }
  }

  const enrollments = await Enrollment.find({ paymentStatus: "completed" })
    .populate("user", "name email mobile")
    .populate("course", "title price type")
    .sort({ createdAt: -1 })

  return { success: true, enrollments }
}

export async function createDiscount(formData: FormData) {
  const userId = cookies().get("user_id")?.value

  if (!userId) {
    return { success: false, message: "Not authenticated" }
  }

  await connectDB()

  const user = await User.findById(userId)

  if (!user || user.role !== "admin") {
    return { success: false, message: "Not authorized" }
  }

  const code = formData.get("code") as string
  const percentage = Number.parseFloat(formData.get("percentage") as string)
  const maxAmount = Number.parseFloat(formData.get("maxAmount") as string)
  const validFrom = new Date(formData.get("validFrom") as string)
  const validUntil = new Date(formData.get("validUntil") as string)

  if (!code || isNaN(percentage) || isNaN(maxAmount) || !validFrom || !validUntil) {
    return { success: false, message: "All fields are required" }
  }

  // Check if discount code already exists
  const existingDiscount = await Discount.findOne({ code })

  if (existingDiscount) {
    return { success: false, message: "Discount code already exists" }
  }

  const discount = new Discount({
    code,
    percentage,
    maxAmount,
    validFrom,
    validUntil,
    isActive: true,
  })

  await discount.save()

  revalidatePath("/admin/discounts")

  return { success: true, message: "Discount created successfully" }
}

export async function getAllDiscounts() {
  const userId = cookies().get("user_id")?.value

  if (!userId) {
    return { success: false, message: "Not authenticated" }
  }

  await connectDB()

  const user = await User.findById(userId)

  if (!user || user.role !== "admin") {
    return { success: false, message: "Not authorized" }
  }

  const discounts = await Discount.find().sort({ createdAt: -1 })

  return { success: true, discounts }
}

export async function toggleDiscountStatus(id: string) {
  const userId = cookies().get("user_id")?.value

  if (!userId) {
    return { success: false, message: "Not authenticated" }
  }

  await connectDB()

  const user = await User.findById(userId)

  if (!user || user.role !== "admin") {
    return { success: false, message: "Not authorized" }
  }

  const discount = await Discount.findById(id)

  if (!discount) {
    return { success: false, message: "Discount not found" }
  }

  discount.isActive = !discount.isActive
  await discount.save()

  revalidatePath("/admin/discounts")

  return { success: true, message: "Discount status updated" }
}

