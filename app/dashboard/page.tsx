import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getUserEnrolledCourses } from "@/app/actions/course-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const userId = cookies().get("user_id")?.value

  if (!userId) {
    redirect("/auth/signin")
  }

  const courses = await getUserEnrolledCourses()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Your Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
            <CardDescription>You have {courses.length} enrolled courses</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/courses">
              <Button className="w-full">View My Courses</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Browse Courses</CardTitle>
            <CardDescription>Discover new courses to enhance your skills</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/courses">
              <Button className="w-full">Browse Courses</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>View your payment and subscription history</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/payments">
              <Button className="w-full">View Payment History</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscriptions</CardTitle>
            <CardDescription>Manage your subscription plans</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/subscriptions">
              <Button className="w-full">Manage Subscriptions</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account details and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/settings">
              <Button className="w-full">Account Settings</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

