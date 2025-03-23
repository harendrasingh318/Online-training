import mongoose, { Schema, type Document } from "mongoose"

export interface IDiscount extends Document {
  code: string
  percentage: number
  maxAmount: number
  validFrom: Date
  validUntil: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const DiscountSchema = new Schema<IDiscount>(
  {
    code: { type: String, required: true, unique: true },
    percentage: { type: Number, required: true },
    maxAmount: { type: Number, required: true },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default mongoose.models.Discount || mongoose.model<IDiscount>("Discount", DiscountSchema)

