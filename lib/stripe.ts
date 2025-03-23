import { loadStripe } from "@stripe/stripe-js"

// Load the Stripe public key
export const getStripe = () => {
  const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  if (!stripePublicKey) {
    throw new Error("Stripe publishable key is not set in environment variables")
  }

  return loadStripe(stripePublicKey)
}

