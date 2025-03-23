"use client"

import { useActionState } from "react"
import { createCourse } from "@/app/actions/course-actions"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function NewCoursePage() {
  const router = useRouter()
  const [state, action, isPending] = useActionState(createCourse, {
    onSuccess: () => {
      router.push("/admin/courses")
    },
  })

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Course</CardTitle>
          <CardDescription>Create a new course for your students</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title</Label>
              <Input id="title" name="title" placeholder="Enter course title" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter course description"
                className="min-h-32"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter course price"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input id="imageUrl" name="imageUrl" placeholder="Enter image URL" required />
            </div>

            <div className="space-y-2">
              <Label>Course Type</Label>
              <RadioGroup defaultValue="recorded" name="type" className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="live" id="live" />
                  <Label htmlFor="live">Live</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="recorded" id="recorded" />
                  <Label htmlFor="recorded">Recorded</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min="1"
                placeholder="Enter course duration in minutes"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor Name</Label>
              <Input id="instructor" name="instructor" placeholder="Enter instructor name" required />
            </div>

            {state && !state.success && <p className="text-sm text-red-500">{state.message}</p>}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/courses")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Course"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

