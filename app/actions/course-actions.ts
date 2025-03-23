"use server"

import { revalidatePath } from "next/cache"
import connectDB from "@/lib/db"
import Course from "@/lib/models/course"
import User from "@/lib/models/user"
import Enrollment from "@/lib/models/enrollment"
import Discount from "@/lib/models/discount"
import { cookies } from "next/headers"
import mongoose from "mongoose"

export async function getAllCourses() {
  await connectDB()
  const courses = await Course.find().sort({ createdAt: -1 })
  return courses
}

export async function getCourseById(id: string) {
  await connectDB()
  const course = await Course.findById(id)
  return course
}

export async function getUserEnrolledCourses() {
  const userId = cookies().get("user_id")?.value

  if (!userId) {
    return []
  }

  await connectDB()

  const enrollments = await Enrollment.find({
    user: userId,
    paymentStatus: "completed",
  }).populate("course")

  return enrollments.map((enrollment) => enrollment.course)
}

export async function createCourse(formData: FormData) {
  const userId = cookies().get("user_id")?.value

  if (!userId) {
    return { success: false, message: "Not authenticated" }
  }

  await connectDB()

  const user = await User.findById(userId)

  if (!user || user.role !== "admin") {
    return { success: false, message: "Not authorized" }
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const price = Number.parseFloat(formData.get("price") as string)
  const imageUrl = formData.get("imageUrl") as string
  const type = formData.get("type") as "live" | "recorded"
  const duration = Number.parseInt(formData.get("duration") as string)
  const instructor = formData.get("instructor") as string

  if (!title || !description || isNaN(price) || !imageUrl || !type || isNaN(duration) || !instructor) {
    return { success: false, message: "All fields are required" }
  }

  const course = new Course({
    title,
    description,
    price,
    imageUrl,
    type,
    duration,
    instructor,
  })

  await course.save()

  revalidatePath("/admin/courses")

  return { success: true, message: "Course created successfully" }
}

export async function validateDiscount(code: string, courseId: string) {
  await connectDB()

  const discount = await Discount.findOne({
    code,
    isActive: true,
    validFrom: { $lte: new Date() },
    validUntil: { $gte: new Date() },
  })

  if (!discount) {
    return { valid: false, message: "Invalid or expired discount code" }
  }

  const course = await Course.findById(courseId)

  if (!course) {
    return { valid: false, message: "Course not found" }
  }

  const discountAmount = Math.min((course.price * discount.percentage) / 100, discount.maxAmount)

  return {
    valid: true,
    discountId: discount._id,
    percentage: discount.percentage,
    discountAmount,
    finalPrice: course.price - discountAmount,
  }
}

export async function enrollInCourse(formData: FormData) {
  const userId = cookies().get("user_id")?.value

  if (!userId) {
    return { success: false, message: "Not authenticated" }
  }

  const courseId = formData.get("courseId") as string
  const discountId = (formData.get("discountId") as string) || null

  if (!courseId) {
    return { success: false, message: "Course ID is required" }
  }

  await connectDB()

  const course = await Course.findById(courseId)

  if (!course) {
    return { success: false, message: "Course not found" }
  }

  // Check if already enrolled
  const existingEnrollment = await Enrollment.findOne({
    user: userId,
    course: courseId,
    paymentStatus: "completed",
  })

  if (existingEnrollment) {
    return { success: false, message: "Already enrolled in this course" }
  }

  let discountAmount = 0
  let paymentAmount = course.price

  if (discountId) {
    const discount = await Discount.findById(discountId)

    if (discount && discount.isActive) {
      discountAmount = Math.min((course.price * discount.percentage) / 100, discount.maxAmount)
      paymentAmount = course.price - discountAmount
    }
  }

  // In a real app, process payment here

  // Create enrollment record
  const enrollment = new Enrollment({
    user: new mongoose.Types.ObjectId(userId),
    course: course._id,
    paymentAmount,
    discountApplied: discountId ? new mongoose.Types.ObjectId(discountId) : null,
    discountAmount,
    paymentStatus: "completed",
    paymentDate: new Date(),
  })

  await enrollment.save()

  // Update user's enrolled courses
  await User.findByIdAndUpdate(userId, {
    $addToSet: { enrolledCourses: course._id },
  })

  // Update course's enrolled users
  await Course.findByIdAndUpdate(courseId, {
    $addToSet: { enrolledUsers: userId },
  })

  revalidatePath("/dashboard/courses")

  return { success: true, message: "Successfully enrolled in the course" }
}

