import mongoose, { Schema, type Document } from "mongoose"

export interface IEnrollment extends Document {
  user: mongoose.Types.ObjectId
  course: mongoose.Types.ObjectId
  paymentAmount: number
  discountApplied: mongoose.Types.ObjectId | null
  discountAmount: number
  paymentStatus: "pending" | "completed" | "failed"
  paymentDate: Date
  paymentMethod: string
  transactionId: string
  receiptSent: boolean
  createdAt: Date
  updatedAt: Date
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    paymentAmount: { type: Number, required: true },
    discountApplied: { type: Schema.Types.ObjectId, ref: "Discount", default: null },
    discountAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    paymentDate: { type: Date },
    paymentMethod: { type: String, default: "card" },
    transactionId: { type: String },
    receiptSent: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export default mongoose.models.Enrollment || mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema)

