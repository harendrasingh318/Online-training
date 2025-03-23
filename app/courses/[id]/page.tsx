import { getCourseById } from "@/app/actions/course-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import PaymentForm from "./payment-form"

export default async function CourseDetailsPage({ params }: { params: { id: string } }) {
  const course = await getCourseById(params.id)

  if (!course) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-3xl font-bold mb-6">Course Not Found</h1>
        <p>The course you are looking for does not exist or has been removed.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative h-64 w-full mb-6 rounded-lg overflow-hidden">
            <Image
              src={course.imageUrl || "/placeholder.svg?height=300&width=600"}
              alt={course.title}
              fill
              className="object-cover"
            />
          </div>

          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>

          <div className="flex items-center gap-2 mb-6">
            <Badge variant={course.type === "live" ? "default" : "secondary"}>
              {course.type === "live" ? "Live" : "Recorded"}
            </Badge>
            <span className="text-muted-foreground">Duration: {course.duration} minutes</span>
            <span className="text-muted-foreground">Instructor: {course.instructor}</span>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>About this course</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{course.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What you&apos;ll learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Comprehensive understanding of the subject matter</li>
                <li>Practical skills that you can apply immediately</li>
                <li>Industry best practices and techniques</li>
                <li>Problem-solving approaches for real-world scenarios</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Course Enrollment</CardTitle>
              <CardDescription>Enroll now to get access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">${course.price.toFixed(2)}</div>
              <PaymentForm courseId={course._id.toString()} price={course.price} title={course.title} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

