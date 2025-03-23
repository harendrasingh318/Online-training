"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import LoginDialog from "./login-dialog"

export default function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const userId = document.cookie.split("; ").find((row) => row.startsWith("user_id="))
    setIsLoggedIn(!!userId)

    // In a real app, you would check the user role here
    // For now, we'll just use a placeholder
    // This would typically be done via a server component or API call
    const checkAdmin = async () => {
      try {
        const response = await fetch("/api/check-admin")
        const data = await response.json()
        setIsAdmin(data.isAdmin)
      } catch (error) {
        console.error("Error checking admin status:", error)
      }
    }

    if (isLoggedIn) {
      checkAdmin()
    }
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">OurSkillLab</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/courses"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/courses" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Courses
          </Link>

          {isLoggedIn && (
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname.startsWith("/dashboard") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname.startsWith("/admin") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">My Account</Button>
              </Link>
              <Link href="/auth/signout">
                <Button>Sign Out</Button>
              </Link>
            </>
          ) : (
            <>
              <LoginDialog trigger={<Button variant="ghost">Sign In</Button>} />
              <Link href="/auth/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t p-4">
          <nav className="flex flex-col space-y-4">
            <Link
              href="/courses"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/courses" ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Courses
            </Link>

            {isLoggedIn && (
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname.startsWith("/dashboard") ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname.startsWith("/admin") ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
            )}

            {isLoggedIn ? (
              <>
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    My Account
                  </Button>
                </Link>
                <Link href="/auth/signout" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full justify-start">Sign Out</Button>
                </Link>
              </>
            ) : (
              <>
                <LoginDialog
                  trigger={
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                      Sign In
                    </Button>
                  }
                />
                <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full justify-start">Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

