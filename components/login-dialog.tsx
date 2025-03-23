"use client"

import type React from "react"

import { useState } from "react"
import { useActionState } from "react"
import {
  requestMobileOTP,
  requestEmailOTP,
  verifyMobileOTPAndLogin,
  verifyEmailOTPAndLogin,
} from "@/app/actions/auth-actions"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"

export default function LoginDialog({ trigger }: { trigger: React.ReactNode }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [mobileState, mobileAction, isPendingMobile] = useActionState(requestMobileOTP)
  const [emailState, emailAction, isPendingEmail] = useActionState(requestEmailOTP)
  const [verifyMobileState, verifyMobileAction, isPendingVerifyMobile] = useActionState(verifyMobileOTPAndLogin)
  const [verifyEmailState, verifyEmailAction, isPendingVerifyEmail] = useActionState(verifyEmailOTPAndLogin)

  const [showMobileOTP, setShowMobileOTP] = useState(false)
  const [showEmailOTP, setShowEmailOTP] = useState(false)
  const [mobile, setMobile] = useState("")
  const [email, setEmail] = useState("")

  const handleMobileOTPRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("mobile", mobile)
    const result = await mobileAction(formData)

    if (result?.success) {
      setShowMobileOTP(true)
    }
  }

  const handleEmailOTPRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("email", email)
    const result = await emailAction(formData)

    if (result?.success) {
      setShowEmailOTP(true)
    }
  }

  const handleMobileVerify = async (formData: FormData) => {
    formData.append("mobile", mobile)
    const result = await verifyMobileAction(formData)

    if (result?.success) {
      setOpen(false)
      router.refresh()
    }
  }

  const handleEmailVerify = async (formData: FormData) => {
    formData.append("email", email)
    const result = await verifyEmailAction(formData)

    if (result?.success) {
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Sign in</DialogTitle>
          <DialogDescription className="text-center">Choose your preferred sign in method</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="mobile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mobile">Mobile</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>

          <TabsContent value="mobile">
            {!showMobileOTP ? (
              <form onSubmit={handleMobileOTPRequest} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </div>

                {mobileState && !mobileState.success && <p className="text-sm text-red-500">{mobileState.message}</p>}

                <Button type="submit" className="w-full" disabled={isPendingMobile}>
                  {isPendingMobile ? "Sending OTP..." : "Send OTP"}
                </Button>
              </form>
            ) : (
              <form action={handleMobileVerify} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP</Label>
                  <Input id="otp" name="otp" type="text" placeholder="Enter OTP sent to your mobile" required />
                </div>

                {verifyMobileState && !verifyMobileState.success && (
                  <p className="text-sm text-red-500">{verifyMobileState.message}</p>
                )}

                <Button type="submit" className="w-full" disabled={isPendingVerifyMobile}>
                  {isPendingVerifyMobile ? "Verifying..." : "Verify OTP"}
                </Button>
              </form>
            )}
          </TabsContent>

          <TabsContent value="email">
            {!showEmailOTP ? (
              <form onSubmit={handleEmailOTPRequest} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {emailState && !emailState.success && <p className="text-sm text-red-500">{emailState.message}</p>}

                <Button type="submit" className="w-full" disabled={isPendingEmail}>
                  {isPendingEmail ? "Sending OTP..." : "Send OTP"}
                </Button>
              </form>
            ) : (
              <form action={handleEmailVerify} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP</Label>
                  <Input id="otp" name="otp" type="text" placeholder="Enter OTP sent to your email" required />
                </div>

                {verifyEmailState && !verifyEmailState.success && (
                  <p className="text-sm text-red-500">{verifyEmailState.message}</p>
                )}

                <Button type="submit" className="w-full" disabled={isPendingVerifyEmail}>
                  {isPendingVerifyEmail ? "Verifying..." : "Verify OTP"}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>

        <div className="text-sm text-center mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-primary font-medium" onClick={() => setOpen(false)}>
            Sign up
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}

