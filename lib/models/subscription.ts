import mongoose, { Schema, type Document } from "mongoose"

export interface ISubscriptionPlan extends Document {
  name: string
  description: string
  price: number
  interval: "month" | "year"
  features: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    interval: { type: String, enum: ["month", "year"], required: true },
    features: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export interface IUserSubscription extends Document {
  user: mongoose.Types.ObjectId
  plan: mongoose.Types.ObjectId
  status: "active" | "canceled" | "expired"
  startDate: Date
  endDate: Date
  stripeSubscriptionId: string
  stripeCustomerId: string
  cancelAtPeriodEnd: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSubscriptionSchema = new Schema<IUserSubscription>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true },
    status: {
      type: String,
      enum: ["active", "canceled", "expired"],
      default: "active",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    stripeSubscriptionId: { type: String, required: true },
    stripeCustomerId: { type: String, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export const SubscriptionPlan =
  mongoose.models.SubscriptionPlan || mongoose.model<ISubscriptionPlan>("SubscriptionPlan", SubscriptionPlanSchema)

export const UserSubscription =
  mongoose.models.UserSubscription || mongoose.model<IUserSubscription>("UserSubscription", UserSubscriptionSchema)

