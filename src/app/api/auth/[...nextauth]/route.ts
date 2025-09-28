import NextAuth, { type NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

import { db } from "@/lib/db"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user) {
          return null
        }

        // Note: For demo purposes, we'll hash the password on registration
        // In production, ensure proper password hashing
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password || ""
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role
      }
      
      // Handle session updates
      if (trigger === "update" && session) {
        token.name = session.name
        token.email = session.email
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role
      }
      return session
    },
    async signIn({ user, account }) {
      // Auto-approve church members based on email domain or other criteria
      if (account?.provider === "google") {
        const existingUser = await db.user.findUnique({
          where: { email: user.email! }
        })

        if (!existingUser) {
          // Create new user with church verification logic
          await db.user.create({
            data: {
              email: user.email!,
              name: user.name!,
              image: user.image,
              role: 'CUSTOMER',
              // Add church verification logic here
              isVerified: false,
            }
          })
        }
      }
      return true
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }