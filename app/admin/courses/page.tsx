import { redirect } from "next/navigation"
import { isAdmin } from "@/app/actions/admin-actions"
import { getAllCourses } from "@/app/actions/course-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default async function AdminCoursesPage() {
  const adminStatus = await isAdmin()

  if (!adminStatus) {
    redirect("/auth/signin")
  }

  const courses = await getAllCourses()

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Courses</h1>
        <Link href="/admin/courses/new">
          <Button>Add New Course</Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">No courses available</h2>
          <p className="text-muted-foreground mb-6">Add your first course to get started</p>
          <Link href="/admin/courses/new">
            <Button size="lg">Add New Course</Button>
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
              </CardHeader>
              <CardContent>
                <p className="mb-4 font-bold">${course.price.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Enrolled: {course.enrolledUsers?.length || 0} students
                </p>
                <div className="flex space-x-2">
                  <Link href={`/admin/courses/${course._id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/admin/courses/${course._id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

