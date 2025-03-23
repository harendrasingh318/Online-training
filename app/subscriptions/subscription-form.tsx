"use client"

import { useEffect } from "react"

import type React from "react"

import { useState } from "react"
import { useActionState } from "react"
import { createSubscription } from "@/app/actions/payment-actions"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CardElement, Elements, useStripe, useElements } from "@stripe/react-stripe-js"
import { getStripe } from "@/lib/stripe"
import { Loader2 } from "lucide-react"
import LoginDialog from "@/components/login-dialog"

interface SubscriptionFormProps {
  planId: string
}

function CheckoutForm({
  planId,
  onSuccess,
}: {
  planId: string
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [subscriptionState, subscriptionAction] = useActionState(createSubscription)

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

    // Create payment method
    const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    })

    if (paymentMethodError) {
      setError(paymentMethodError.message || "An error occurred with your payment method")
      setProcessing(false)
      return
    }

    // Create subscription
    const formData = new FormData()
    formData.append("planId", planId)
    formData.append("paymentMethodId", paymentMethod.id)

    const result = await subscriptionAction(formData)

    if (result?.success && result.clientSecret) {
      // Confirm subscription payment
      const { error: confirmError } = await stripe.confirmCardPayment(result.clientSecret)

      if (confirmError) {
        setError(confirmError.message || "An error occurred confirming your subscription")
      } else {
        onSuccess()
      }
    } else {
      setError(result?.message || "Failed to create subscription")
    }

    setProcessing(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="card-element" className="block text-sm font-medium">
          Card Details
        </label>
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

      {subscriptionState && !subscriptionState.success && (
        <div className="text-sm text-red-500">{subscriptionState.message}</div>
      )}

      <Button type="submit" className="w-full" disabled={!stripe || processing}>
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Subscribe Now"
        )}
      </Button>
    </form>
  )
}

export default function SubscriptionForm({ planId }: SubscriptionFormProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const userId = document.cookie.split("; ").find((row) => row.startsWith("user_id="))
    setIsLoggedIn(!!userId)
  }, [])

  const handleOpenSubscription = () => {
    if (!isLoggedIn) {
      return
    }

    setIsOpen(true)
  }

  const handleSuccess = () => {
    setIsOpen(false)
    router.refresh()
  }

  return (
    <>
      {isLoggedIn ? (
        <Button className="w-full" onClick={handleOpenSubscription}>
          Subscribe
        </Button>
      ) : (
        <LoginDialog trigger={<Button className="w-full">Sign in to Subscribe</Button>} />
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subscribe to Plan</DialogTitle>
            <DialogDescription>Enter your payment details to complete your subscription</DialogDescription>
          </DialogHeader>

          <Elements stripe={getStripe()}>
            <CheckoutForm planId={planId} onSuccess={handleSuccess} />
          </Elements>
        </DialogContent>
      </Dialog>
    </>
  )
}

