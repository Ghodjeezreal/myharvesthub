import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      )
    }

    if (session.user.role !== "VENDOR") {
      return NextResponse.json(
        { message: "Vendor access required" },
        { status: 403 }
      )
    }

    // Get vendor data
    const vendor = await db.vendor.findUnique({
      where: { userId: session.user.id },
      include: {
        products: true,
        orders: true,
      }
    })

    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found" },
        { status: 404 }
      )
    }

    // Calculate stats
    const stats = {
      totalProducts: vendor.products.length,
      totalOrders: vendor.orders.length,
      totalRevenue: vendor.totalSales,
      pendingOrders: vendor.orders.filter((order: any) => order.status === "PENDING").length,
    }

    return NextResponse.json({
      vendor: {
        id: vendor.id,
        businessName: vendor.businessName,
        status: vendor.status,
        totalSales: vendor.totalSales,
        totalOrders: vendor.totalOrders,
        averageRating: vendor.averageRating,
        isActive: vendor.isActive,
      },
      stats
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}