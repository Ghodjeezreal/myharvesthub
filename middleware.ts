import { withAuth } from "next-auth/middleware"

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    // Add any additional middleware logic here if needed
    return
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if accessing admin routes
        if (req.nextUrl.pathname.startsWith("/admin")) {
          // Only allow access if user has ADMIN role
          return token?.role === "ADMIN"
        }
        
        // Check if accessing vendor routes
        if (req.nextUrl.pathname.startsWith("/vendor")) {
          // Allow access if user has VENDOR or ADMIN role
          return token?.role === "VENDOR" || token?.role === "ADMIN"
        }

        // For other protected routes, just check if user is authenticated
        return !!token
      },
    },
  }
)

// Specify which routes should be protected
export const config = {
  matcher: [
    "/admin/:path*",
    "/vendor/:path*"
  ]
}