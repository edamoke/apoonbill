"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ShieldCheck } from "lucide-react"

export default function AdminSignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) throw signInError

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not found after sign in")
      }

      let profile = null
      let retries = 0
      while (!profile && retries < 3) {
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("role, is_admin, is_chef, is_rider, is_accountant, email_confirmed")
          .eq("id", user.id)
          .single()

        if (data) {
          profile = data
          break
        }

        if (profileError && !profileError.message.includes("multiple")) {
          console.error("Profile fetch error:", profileError)
        }

        retries++
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      const hasAdminAccess =
        profile?.is_admin ||
        profile?.is_chef ||
        profile?.is_rider ||
        profile?.is_accountant ||
        profile?.role === "admin"

      if (!hasAdminAccess) {
        await supabase.auth.signOut()
        setError("Access denied. Admin credentials required.")
        setIsLoading(false)
        return
      }

      window.location.href = "/admin"
    } catch (error: unknown) {
      console.error("Login error:", error)
      setError(error instanceof Error ? error.message : "An error occurred during sign in")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <Card className="border-border">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-3">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl font-serif">Admin Portal</CardTitle>
              <CardDescription>Sign in with your admin credentials</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@thespoonbill.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in as Admin"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <Link href="/auth/login" className="underline underline-offset-4 hover:text-foreground">
                  Regular user sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
