"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useActionState } from "react"
import { createPaymentIntent, confirmEnrollment } from "@/app/actions/payment-actions"
import { validateDiscount } from "@/app/actions/course-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CardElement, Elements, useStripe, useElements } from "@stripe/react-stripe-js"
import { getStripe } from "@/lib/stripe"
import { Loader2 } from "lucide-react"
import LoginDialog from "@/components/login-dialog"

interface PaymentFormProps {
  courseId: string
  price: number
  title: string
}

function CheckoutForm({
  courseId,
  price,
  clientSecret,
  discountInfo,
  onSuccess,
}: {
  courseId: string
  price: number
  clientSecret: string
  discountInfo: any
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [confirmState, confirmAction] = useActionState(confirmEnrollment)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setError("Card element not found")
      setProcessing(false)
      return
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          // You can collect billing details here if needed
        },
      },
    })

    if (error) {
      setError(error.message || "An error occurred during payment")
      setProcessing(false)
    } else if (paymentIntent.status === "succeeded") {
      // Payment successful, create enrollment
      const formData = new FormData()
      formData.append("courseId", courseId)
      formData.append("paymentIntentId", paymentIntent.id)

      if (discountInfo?.valid && discountInfo.discountId) {
        formData.append("discountId", discountInfo.discountId)
      }

      const result = await confirmAction(formData)

      if (result?.success) {
        onSuccess()
      } else {
        setError(result?.message || "Failed to complete enrollment")
      }
    }

    setProcessing(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="card-element">Card Details</Label>
        <div className="p-3 border rounded-md">
          <CardElement
            id="card-element"
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      {confirmState && !confirmState.success && <div className="text-sm text-red-500">{confirmState.message}</div>}

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

      <Button type="submit" className="w-full" disabled={!stripe || processing}>
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay $${discountInfo?.valid ? discountInfo.finalPrice.toFixed(2) : price.toFixed(2)}`
        )}
      </Button>
    </form>
  )
}

export default function PaymentForm({ courseId, price, title }: PaymentFormProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [clientSecret, setClientSecret] = useState("")
  const [discountCode, setDiscountCode] = useState("")
  const [discountInfo, setDiscountInfo] = useState<any>(null)
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const userId = document.cookie.split("; ").find((row) => row.startsWith("user_id="))
    setIsLoggedIn(!!userId)
  }, [])

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

  const handleOpenPayment = async () => {
    if (!isLoggedIn) {
      return
    }

    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append("courseId", courseId)

      if (discountInfo?.valid && discountInfo.discountId) {
        formData.append("discountId", discountInfo.discountId)
      }

      const response = await createPaymentIntent(formData)

      if (response.success && response.clientSecret) {
        setClientSecret(response.clientSecret)
        setIsOpen(true)
      } else {
        console.error("Failed to create payment intent:", response.message)
      }
    } catch (error) {
      console.error("Error creating payment intent:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSuccess = () => {
    setIsOpen(false)
    router.push("/dashboard/courses")
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

      {isLoggedIn ? (
        <Button className="w-full" onClick={handleOpenPayment} disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Proceed to Payment"
          )}
        </Button>
      ) : (
        <LoginDialog trigger={<Button className="w-full">Sign in to Enroll</Button>} />
      )}

      {clientSecret && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Complete Your Purchase</DialogTitle>
              <DialogDescription>
                You are enrolling in <strong>{title}</strong>
              </DialogDescription>
            </DialogHeader>

            <Elements stripe={getStripe()}>
              <CheckoutForm
                courseId={courseId}
                price={price}
                clientSecret={clientSecret}
                discountInfo={discountInfo}
                onSuccess={handleSuccess}
              />
            </Elements>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

