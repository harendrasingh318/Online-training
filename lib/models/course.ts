import mongoose, { Schema, type Document } from "mongoose"

export interface ICourse extends Document {
  title: string
  description: string
  price: number
  imageUrl: string
  type: "live" | "recorded"
  duration: number // in minutes
  instructor: string
  enrolledUsers: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    type: { type: String, enum: ["live", "recorded"], required: true },
    duration: { type: Number, required: true },
    instructor: { type: String, required: true },
    enrolledUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
)

export default mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema)

