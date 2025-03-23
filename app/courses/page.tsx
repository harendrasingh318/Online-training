import { getAllCourses } from "@/app/actions/course-actions"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default async function CoursesPage() {
  const courses = await getAllCourses()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Available Courses</h1>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">No courses available</h2>
          <p className="text-muted-foreground">Please check back later for new courses</p>
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
                <p className="mt-4 font-bold text-lg">${course.price.toFixed(2)}</p>
              </CardContent>
              <CardFooter>
                <Link href={`/courses/${course._id}`} className="w-full">
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

