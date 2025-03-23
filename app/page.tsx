import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getAllCourses } from "@/app/actions/course-actions"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export default async function HomePage() {
  const courses = await getAllCourses()
  const featuredCourses = courses.slice(0, 3)

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-muted py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Enhance Your Skills with <span className="text-primary">OurSkillLab</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Access high-quality courses taught by industry experts. Learn at your own pace and take your career to the
            next level.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/courses">
              <Button size="lg">Browse Courses</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline">
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Featured Courses</h2>
            <Link href="/courses">
              <Button variant="outline">View All Courses</Button>
            </Link>
          </div>

          {featuredCourses.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-4">No courses available yet</h3>
              <p className="text-muted-foreground mb-6">Check back soon for new courses</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredCourses.map((course) => (
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
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose OurSkillLab?</h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Expert Instructors</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Learn from industry professionals with years of experience in their fields.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Flexible Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Access both live and recorded courses to fit your schedule and learning style.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Affordable Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Quality education at competitive prices with regular discounts and special offers.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

