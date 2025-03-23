import { redirect } from "next/navigation"
import { isAdmin, getEnrollmentReports } from "@/app/actions/admin-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function EnrollmentReportsPage() {
  const adminStatus = await isAdmin()

  if (!adminStatus) {
    redirect("/auth/signin")
  }

  const { success, enrollments, message } = await getEnrollmentReports()

  if (!success) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Enrollment Reports</h1>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-red-500">{message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Enrollment Reports</h1>

      <Card>
        <CardHeader>
          <CardTitle>Course Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground">No enrollments found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enrollment) => (
                  <TableRow key={enrollment._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{enrollment.user.name}</p>
                        <p className="text-sm text-muted-foreground">{enrollment.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{enrollment.course.title}</TableCell>
                    <TableCell>
                      <Badge variant={enrollment.course.type === "live" ? "default" : "secondary"}>
                        {enrollment.course.type === "live" ? "Live" : "Recorded"}
                      </Badge>
                    </TableCell>
                    <TableCell>${enrollment.paymentAmount.toFixed(2)}</TableCell>
                    <TableCell>{new Date(enrollment.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

