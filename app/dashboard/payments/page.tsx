import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getUserPaymentHistory } from "@/app/actions/payment-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default async function PaymentHistoryPage() {
  const userId = cookies().get("user_id")?.value

  if (!userId) {
    redirect("/auth/signin")
  }

  const { success, enrollments, subscriptions, message } = await getUserPaymentHistory()

  if (!success) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Payment History</h1>
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Payment History</h1>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <Tabs defaultValue="courses">
        <TabsList className="mb-6">
          <TabsTrigger value="courses">Course Purchases</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Course Purchases</CardTitle>
              <CardDescription>Your course purchase history</CardDescription>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <p className="text-center py-10 text-muted-foreground">No course purchases found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Receipt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enrollment) => (
                      <TableRow key={enrollment._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{enrollment.course.title}</p>
                            <Badge variant={enrollment.course.type === "live" ? "default" : "secondary"}>
                              {enrollment.course.type === "live" ? "Live" : "Recorded"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(enrollment.paymentDate).toLocaleDateString()}</TableCell>
                        <TableCell>${enrollment.paymentAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          {enrollment.discountAmount > 0 ? (
                            <span className="text-green-500">-${enrollment.discountAmount.toFixed(2)}</span>
                          ) : (
                            "None"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{enrollment.paymentStatus}</Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={`/api/receipts/${enrollment._id}`} target="_blank">
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Receipt
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Subscription History</CardTitle>
              <CardDescription>Your subscription payment history</CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptions.length === 0 ? (
                <p className="text-center py-10 text-muted-foreground">No subscription history found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((subscription) => (
                      <TableRow key={subscription._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{subscription.plan.name}</p>
                            <p className="text-sm text-muted-foreground">{subscription.plan.interval}ly</p>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(subscription.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(subscription.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          ${subscription.plan.price.toFixed(2)}/{subscription.plan.interval}
                        </TableCell>
                        <TableCell>
                          <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                            {subscription.status}
                            {subscription.cancelAtPeriodEnd && " (cancels at period end)"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

