import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getUserEnrolledCourses } from "@/app/actions/course-actions"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default async function EnrolledCoursesPage() {
  const userId = cookies().get("user_id")?.value

  if (!userId) {
    redirect("/auth/signin")
  }

  const courses = await getUserEnrolledCourses()

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <Link href="/courses">
          <Button>Browse More Courses</Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">You haven&apos;t enrolled in any courses yet</h2>
          <p className="text-muted-foreground mb-6">Browse our catalog and enroll in a course to get started</p>
          <Link href="/courses">
            <Button size="lg">Browse Courses</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course._id} className="overflow-hidden">
              <div className="relative h-48 w-full">
                <Image
                  src={course.imageUrl || "/placeholder.svg?height=200&width=400"}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{course.title}</CardTitle>
                  <Badge variant={course.type === "live" ? "default" : "secondary"}>
                    {course.type === "live" ? "Live" : "Recorded"}
                  </Badge>
                </div>
                <CardDescription>Duration: {course.duration} minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3">{course.description}</p>
              </CardContent>
              <CardFooter>
                <Link href={`/dashboard/courses/${course._id}`} className="w-full">
                  <Button className="w-full">Start Learning</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

