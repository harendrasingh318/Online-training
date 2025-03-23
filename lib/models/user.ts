import mongoose, { Schema, type Document } from "mongoose"
import { hash, compare } from "bcryptjs"

export interface IUser extends Document {
  name: string
  email: string
  mobile: string
  password: string
  role: "user" | "admin"
  enrolledCourses: mongoose.Types.ObjectId[]
  stripeCustomerId?: string
  createdAt: Date
  updatedAt: Date
  comparePassword: (password: string) => Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    enrolledCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    stripeCustomerId: { type: String },
  },
  { timestamps: true },
)

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await hash(this.password, 10)
  next()
})

// Method to compare password
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return await compare(password, this.password)
}

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

