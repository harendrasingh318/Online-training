import { redirect } from "next/navigation"
import { isAdmin } from "@/app/actions/admin-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminDashboardPage() {
  const adminStatus = await isAdmin()

  if (!adminStatus) {
    redirect("/auth/signin")
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Courses</CardTitle>
            <CardDescription>Manage your courses</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/courses">
              <Button className="w-full">Manage Courses</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enrollments</CardTitle>
            <CardDescription>View enrollment reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/enrollments">
              <Button className="w-full">View Reports</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Discounts</CardTitle>
            <CardDescription>Manage discount codes</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/discounts">
              <Button className="w-full">Manage Discounts</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

