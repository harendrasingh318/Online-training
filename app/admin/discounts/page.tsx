"use client"

import { useEffect, useState } from "react"
import { getAllDiscounts, toggleDiscountStatus, createDiscount } from "@/app/actions/admin-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { useActionState } from "react"

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const [createState, createAction, isPendingCreate] = useActionState(createDiscount, {
    onSuccess: () => {
      setOpen(false)
      loadDiscounts()
    },
  })

  const loadDiscounts = async () => {
    setLoading(true)
    try {
      const result = await getAllDiscounts()
      if (result.success) {
        setDiscounts(result.discounts)
      }
    } catch (error) {
      console.error("Error loading discounts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDiscounts()
  }, [])

  const handleToggleStatus = async (id) => {
    await toggleDiscountStatus(id)
    loadDiscounts()
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Discount Codes</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add New Discount</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Discount Code</DialogTitle>
              <DialogDescription>Add a new discount code for your courses</DialogDescription>
            </DialogHeader>
            <form action={createAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Discount Code</Label>
                <Input id="code" name="code" placeholder="e.g. SUMMER20" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="percentage">Discount Percentage (%)</Label>
                <Input
                  id="percentage"
                  name="percentage"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="e.g. 20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAmount">Maximum Discount Amount ($)</Label>
                <Input
                  id="maxAmount"
                  name="maxAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From</Label>
                <Input id="validFrom" name="validFrom" type="date" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input id="validUntil" name="validUntil" type="date" required />
              </div>

              {createState && !createState.success && <p className="text-sm text-red-500">{createState.message}</p>}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPendingCreate}>
                  {isPendingCreate ? "Creating..." : "Create Discount"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Discount Codes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : discounts.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground">No discount codes found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Max Amount</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.map((discount) => (
                  <TableRow key={discount._id}>
                    <TableCell className="font-medium">{discount.code}</TableCell>
                    <TableCell>{discount.percentage}%</TableCell>
                    <TableCell>${discount.maxAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>From: {new Date(discount.validFrom).toLocaleDateString()}</p>
                        <p>Until: {new Date(discount.validUntil).toLocaleDateString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={discount.isActive ? "default" : "secondary"}>
                        {discount.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch checked={discount.isActive} onCheckedChange={() => handleToggleStatus(discount._id)} />
                    </TableCell>
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

