import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        _count: {
          select: {
            products: {
              where: {
                status: "ACTIVE"
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Categories API error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}