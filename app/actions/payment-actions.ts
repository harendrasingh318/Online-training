"use server"

import { cookies } from "next/headers"
import connectDB from "@/lib/db"
import Course from "@/lib/models/course"
import User from "@/lib/models/user"
import Enrollment from "@/lib/models/enrollment"
import Discount from "@/lib/models/discount"
import { SubscriptionPlan, UserSubscription } from "@/lib/models/subscription"
import Stripe from "stripe"
import mongoose from "mongoose"
import { sendEmail, generateReceiptEmail } from "@/lib/email-service"

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function createPaymentIntent(formData: FormData) {
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

  // Create a payment intent with Stripe
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(paymentAmount * 100), // Stripe requires amount in cents
      currency: "usd",
      metadata: {
        userId,
        courseId,
        discountId: discountId || "",
        discountAmount: discountAmount.toString(),
      },
    })

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: paymentAmount,
    }
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return { success: false, message: "Failed to create payment" }
  }
}

export async function confirmEnrollment(formData: FormData) {
  const userId = cookies().get("user_id")?.value

  if (!userId) {
    return { success: false, message: "Not authenticated" }
  }

  const courseId = formData.get("courseId") as string
  const paymentIntentId = formData.get("paymentIntentId") as string
  const discountId = (formData.get("discountId") as string) || null

  if (!courseId || !paymentIntentId) {
    return { success: false, message: "Missing required fields" }
  }

  await connectDB()

  // Verify payment intent status with Stripe
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== "succeeded") {
      return { success: false, message: "Payment not completed" }
    }

    const course = await Course.findById(courseId)
    const user = await User.findById(userId)

    if (!course) {
      return { success: false, message: "Course not found" }
    }

    if (!user) {
      return { success: false, message: "User not found" }
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

    // Create enrollment record
    const enrollment = new Enrollment({
      user: new mongoose.Types.ObjectId(userId),
      course: course._id,
      paymentAmount,
      discountApplied: discountId ? new mongoose.Types.ObjectId(discountId) : null,
      discountAmount,
      paymentStatus: "completed",
      paymentDate: new Date(),
      paymentMethod: "card",
      transactionId: paymentIntentId,
      receiptSent: false,
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

    // Send receipt email
    if (user.email) {
      const receiptHtml = generateReceiptEmail({
        userName: user.name,
        courseName: course.title,
        amount: paymentAmount,
        date: new Date(),
        transactionId: paymentIntentId,
        discountApplied: discountAmount,
      })

      const emailResult = await sendEmail({
        to: user.email,
        subject: `Receipt for ${course.title}`,
        html: receiptHtml,
      })

      if (emailResult.success) {
        await Enrollment.findByIdAndUpdate(enrollment._id, {
          receiptSent: true,
        })
      }
    }

    return { success: true, message: "Successfully enrolled in the course" }
  } catch (error) {
    console.error("Error confirming enrollment:", error)
    return { success: false, message: "Failed to confirm enrollment" }
  }
}

export async function createSubscription(formData: FormData) {
  const userId = cookies().get("user_id")?.value

  if (!userId) {
    return { success: false, message: "Not authenticated" }
  }

  const planId = formData.get("planId") as string
  const paymentMethodId = formData.get("paymentMethodId") as string

  if (!planId || !paymentMethodId) {
    return { success: false, message: "Missing required fields" }
  }

  await connectDB()

  try {
    const user = await User.findById(userId)
    const plan = await SubscriptionPlan.findById(planId)

    if (!user) {
      return { success: false, message: "User not found" }
    }

    if (!plan || !plan.isActive) {
      return { success: false, message: "Subscription plan not found or inactive" }
    }

    // Check if user already has an active subscription
    const existingSubscription = await UserSubscription.findOne({
      user: userId,
      status: "active",
    })

    if (existingSubscription) {
      return { success: false, message: "You already have an active subscription" }
    }

    // Create or get Stripe customer
    let customer

    if (user.stripeCustomerId) {
      customer = await stripe.customers.retrieve(user.stripeCustomerId)
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString(),
        },
      })

      // Save Stripe customer ID to user
      await User.findByIdAndUpdate(userId, {
        stripeCustomerId: customer.id,
      })
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    })

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    // Create Stripe product and price if not already created
    let productId = plan.stripeProductId
    let priceId = plan.stripePriceId

    if (!productId) {
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: {
          planId: plan._id.toString(),
        },
      })

      productId = product.id

      // Save Stripe product ID to plan
      await SubscriptionPlan.findByIdAndUpdate(planId, {
        stripeProductId: productId,
      })
    }

    if (!priceId) {
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: Math.round(plan.price * 100),
        currency: "usd",
        recurring: {
          interval: plan.interval,
        },
      })

      priceId = price.id

      // Save Stripe price ID to plan
      await SubscriptionPlan.findByIdAndUpdate(planId, {
        stripePriceId: priceId,
      })
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
        payment_method_types: ["card"],
      },
      expand: ["latest_invoice.payment_intent"],
    })

    // Calculate end date based on interval
    const startDate = new Date()
    const endDate = new Date(startDate)

    if (plan.interval === "month") {
      endDate.setMonth(endDate.getMonth() + 1)
    } else if (plan.interval === "year") {
      endDate.setFullYear(endDate.getFullYear() + 1)
    }

    // Create user subscription record
    const userSubscription = new UserSubscription({
      user: new mongoose.Types.ObjectId(userId),
      plan: plan._id,
      status: "active",
      startDate,
      endDate,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customer.id,
    })

    await userSubscription.save()

    // Get client secret for payment confirmation
    const invoice = subscription.latest_invoice as any
    const clientSecret = invoice.payment_intent?.client_secret

    return {
      success: true,
      subscriptionId: subscription.id,
      clientSecret,
    }
  } catch (error) {
    console.error("Error creating subscription:", error)
    return { success: false, message: "Failed to create subscription" }
  }
}

export async function cancelSubscription(formData: FormData) {
  const userId = cookies().get("user_id")?.value

  if (!userId) {
    return { success: false, message: "Not authenticated" }
  }

  const subscriptionId = formData.get("subscriptionId") as string

  if (!subscriptionId) {
    return { success: false, message: "Subscription ID is required" }
  }

  await connectDB()

  try {
    const userSubscription = await UserSubscription.findOne({
      user: userId,
      stripeSubscriptionId: subscriptionId,
      status: "active",
    })

    if (!userSubscription) {
      return { success: false, message: "Subscription not found" }
    }

    // Cancel at period end
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    // Update user subscription
    await UserSubscription.findByIdAndUpdate(userSubscription._id, {
      cancelAtPeriodEnd: true,
    })

    return { success: true, message: "Subscription will be canceled at the end of the billing period" }
  } catch (error) {
    console.error("Error canceling subscription:", error)
    return { success: false, message: "Failed to cancel subscription" }
  }
}

export async function getUserPaymentHistory() {
  const userId = cookies().get("user_id")?.value

  if (!userId) {
    return { success: false, message: "Not authenticated" }
  }

  await connectDB()

  try {
    // Get all completed enrollments for the user
    const enrollments = await Enrollment.find({
      user: userId,
      paymentStatus: "completed",
    })
      .populate("course", "title imageUrl type")
      .populate("discountApplied", "code percentage")
      .sort({ paymentDate: -1 })

    // Get active subscriptions
    const subscriptions = await UserSubscription.find({
      user: userId,
    })
      .populate("plan")
      .sort({ createdAt: -1 })

    return {
      success: true,
      enrollments,
      subscriptions,
    }
  } catch (error) {
    console.error("Error fetching payment history:", error)
    return { success: false, message: "Failed to fetch payment history" }
  }
}

