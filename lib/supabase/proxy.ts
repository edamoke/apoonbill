import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Missing Supabase environment variables in proxy")
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    (request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.startsWith("/orders") ||
      request.nextUrl.pathname.startsWith("/chef") ||
      request.nextUrl.pathname.startsWith("/accountant") ||
      (request.nextUrl.pathname.startsWith("/admin") && request.nextUrl.pathname !== "/admin/sign-in") ||
      request.nextUrl.pathname.startsWith("/rider"))
  ) {
    const url = request.nextUrl.clone()
    if (request.nextUrl.pathname.startsWith("/admin")) {
      url.pathname = "/admin/sign-in"
    } else {
      url.pathname = "/auth/login"
    }
    return NextResponse.redirect(url)
  }

  // Role-based access control
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_admin, is_accountant, email_confirmed")
      .eq("id", user.id)
      .single()

    // STRICT: Require email verification for all authenticated routes
    if (
      !profile?.email_confirmed &&
      (request.nextUrl.pathname.startsWith("/admin") ||
        request.nextUrl.pathname.startsWith("/accountant") ||
        request.nextUrl.pathname.startsWith("/chef") ||
        request.nextUrl.pathname.startsWith("/rider") ||
        request.nextUrl.pathname.startsWith("/dashboard") ||
        request.nextUrl.pathname.startsWith("/orders"))
    ) {
      // Redirect to login with verification error
      return NextResponse.redirect(new URL("/auth/login?error=verify_email", request.url))
    }

    // Role-based access control (RBAC) - using standard flags only
    const userRole = profile?.role
    const isAdmin = profile?.is_admin

    // Protect accountant routes
    if (
      request.nextUrl.pathname.startsWith("/accountant") &&
      userRole !== "accountant" &&
      !isAdmin &&
      !profile?.is_accountant
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Protect chef routes
    if (request.nextUrl.pathname.startsWith("/chef") && userRole !== "chef" && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Protect rider routes
    if (request.nextUrl.pathname.startsWith("/rider") && userRole !== "rider" && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith("/admin") && !isAdmin && userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return supabaseResponse
}
