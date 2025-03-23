import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import connectDB from "@/lib/db"
import { SubscriptionPlan, UserSubscription } from "@/lib/models/subscription"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import SubscriptionForm from "./subscription-form"

export default async function SubscriptionsPage() {
  const userId = cookies().get("user_id")?.value

  if (!userId) {
    redirect("/auth/signin")
  }

  await connectDB()

  // Get all active subscription plans
  const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 })

  // Check if user has an active subscription
  const userSubscription = await UserSubscription.findOne({
    user: userId,
    status: "active",
  }).populate("plan")

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Subscription Plans</h1>

      {userSubscription && (
        <Card className="mb-8 bg-muted/50">
          <CardHeader>
            <CardTitle>Your Current Subscription</CardTitle>
            <CardDescription>You are currently subscribed to the {userSubscription.plan.name} plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span>Plan:</span>
                <span className="font-medium">{userSubscription.plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Price:</span>
                <span className="font-medium">
                  ${userSubscription.plan.price.toFixed(2)}/{userSubscription.plan.interval}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Start Date:</span>
                <span className="font-medium">{new Date(userSubscription.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Next Billing Date:</span>
                <span className="font-medium">{new Date(userSubscription.endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge variant={userSubscription.cancelAtPeriodEnd ? "secondary" : "default"}>
                  {userSubscription.cancelAtPeriodEnd ? "Cancels at period end" : "Active"}
                </Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <form action="/api/cancel-subscription" method="POST" className="w-full">
              <input type="hidden" name="subscriptionId" value={userSubscription.stripeSubscriptionId} />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
                disabled={userSubscription.cancelAtPeriodEnd}
              >
                {userSubscription.cancelAtPeriodEnd ? "Cancellation Scheduled" : "Cancel Subscription"}
              </button>
            </form>
          </CardFooter>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan._id} className={userSubscription?.plan._id.equals(plan._id) ? "border-primary" : ""}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">
                ${plan.price.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground">/{plan.interval}</span>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {userSubscription?.plan._id.equals(plan._id) ? (
                <div className="w-full px-4 py-2 bg-primary/20 text-center rounded-md">Current Plan</div>
              ) : (
                <SubscriptionForm planId={plan._id.toString()} />
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

