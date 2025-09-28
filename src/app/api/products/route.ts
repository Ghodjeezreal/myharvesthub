import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categorySlug = searchParams.get("category")
    const search = searchParams.get("search")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    // Build where conditions
    const where: any = {
      status: "ACTIVE",
      stockQuantity: { gt: 0 },
      vendor: {
        status: "APPROVED",
        isActive: true
      }
    }

    if (categorySlug && categorySlug !== "all") {
      where.category = {
        slug: categorySlug
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { shortDesc: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
        { vendor: { businessName: { contains: search } } }
      ]
    }

    const products = await db.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        shortDesc: true,
        price: true,
        comparePrice: true,
        stockQuantity: true,
        category: {
          select: { name: true, slug: true }
        },
        vendor: {
          select: { 
            businessName: true, 
            averageRating: true,
            churchAffiliation: true
          }
        },
        images: {
          select: { url: true, isPrimary: true }
        },
        _count: {
          select: { reviews: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset
    })

    // Get total count for pagination
    const totalCount = await db.product.count({ where })

    return NextResponse.json({ 
      products,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    })
  } catch (error) {
    console.error("Products API error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}