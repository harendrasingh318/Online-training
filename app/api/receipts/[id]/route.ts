import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import connectDB from "@/lib/db"
import Enrollment from "@/lib/models/enrollment"
import User from "@/lib/models/user"
import { generateReceiptEmail } from "@/lib/email-service"
import puppeteer from "puppeteer"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const userId = cookies().get("user_id")?.value

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const enrollmentId = params.id

  if (!enrollmentId) {
    return NextResponse.json({ error: "Enrollment ID is required" }, { status: 400 })
  }

  await connectDB()

  try {
    // Find enrollment and check if it belongs to the user
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate("course", "title")
      .populate("discountApplied", "code percentage")

    if (!enrollment || enrollment.user.toString() !== userId) {
      return NextResponse.json({ error: "Enrollment not found or unauthorized" }, { status: 404 })
    }

    const user = await User.findById(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate receipt HTML
    const receiptHtml = generateReceiptEmail({
      userName: user.name,
      courseName: enrollment.course.title,
      amount: enrollment.paymentAmount,
      date: enrollment.paymentDate,
      transactionId: enrollment.transactionId,
      discountApplied: enrollment.discountAmount,
    })

    // Generate PDF from HTML
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })

    const page = await browser.newPage()
    await page.setContent(receiptHtml)

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    })

    await browser.close()

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="receipt-${enrollmentId}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating receipt:", error)
    return NextResponse.json({ error: "Failed to generate receipt" }, { status: 500 })
  }
}

