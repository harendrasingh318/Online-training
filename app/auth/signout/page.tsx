"use client"

import { useEffect } from "react"
import { logoutUser } from "@/app/actions/auth-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignOutPage() {
  useEffect(() => {
    const logout = async () => {
      await logoutUser()
    }

    logout()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Signing out</CardTitle>
          <CardDescription className="text-center">Please wait while we sign you out...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    </div>
  )
}

