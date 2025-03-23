"use client"

import { useState } from "react"
import { useActionState } from "react"
import { validateDiscount, enrollInCourse } from "@/app/actions/course-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

interface EnrollmentFormProps {
  courseId: string
  price: number
}

export default function EnrollmentForm({ courseId, price }: EnrollmentFormProps) {
  const router = useRouter()
  const [enrollState, enrollAction, isPendingEnroll] = useActionState(enrollInCourse, {
    onSuccess: () => {
      router.push("/dashboard/courses")
    },
  })

  const [discountCode, setDiscountCode] = useState("")
  const [discountInfo, setDiscountInfo] = useState<{
    valid: boolean
    discountId?: string
    percentage?: number
    discountAmount?: number
    finalPrice?: number
    message?: string
  } | null>(null)
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false)

  const handleApplyDiscount = async () => {
    if (!discountCode) return

    setIsValidatingDiscount(true)

    try {
      const result = await validateDiscount(discountCode, courseId)
      setDiscountInfo(result)
    } catch (error) {
      setDiscountInfo({
        valid: false,
        message: "Error validating discount code",
      })
    } finally {
      setIsValidatingDiscount(false)
    }
  }

  const handleEnroll = async (formData: FormData) => {
    formData.append("courseId", courseId)

    if (discountInfo?.valid && discountInfo.discountId) {
      formData.append("discountId", discountInfo.discountId)
    }

    await enrollAction(formData)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="discount">Discount Code</Label>
        <div className="flex space-x-2">
          <Input
            id="discount"
            placeholder="Enter discount code"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
          />
          <Button variant="outline" onClick={handleApplyDiscount} disabled={isValidatingDiscount || !discountCode}>
            {isValidatingDiscount ? "Applying..." : "Apply"}
          </Button>
        </div>

        {discountInfo && (
          <p className={`text-sm ${discountInfo.valid ? "text-green-500" : "text-red-500"}`}>
            {discountInfo.valid
              ? `${discountInfo.percentage}% discount applied: -$${discountInfo.discountAmount?.toFixed(2)}`
              : discountInfo.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Original Price:</span>
          <span>${price.toFixed(2)}</span>
        </div>

        {discountInfo?.valid && (
          <>
            <div className="flex justify-between text-green-500">
              <span>Discount:</span>
              <span>-${discountInfo.discountAmount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Final Price:</span>
              <span>${discountInfo.finalPrice?.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      <form action={handleEnroll}>
        {enrollState && !enrollState.success && <p className="text-sm text-red-500 mb-2">{enrollState.message}</p>}

        <Button type="submit" className="w-full" disabled={isPendingEnroll}>
          {isPendingEnroll ? "Processing..." : "Enroll Now"}
        </Button>
      </form>
    </div>
  )
}

