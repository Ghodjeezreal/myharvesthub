import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get dashboard statistics
    const [
      totalUsers,
      totalVendors,
      pendingVendors,
      totalOrders,
      totalProducts,
      activeProducts,
      pendingProducts
    ] = await Promise.all([
      // Total users count
      db.user.count(),
      
      // Total vendors count
      db.vendor.count(),
      
      // Pending vendors count
      db.vendor.count({
        where: { status: 'PENDING' }
      }),
      
      // Total orders count
      db.order.count(),
      
      // Total products count
      db.product.count(),
      
      // Active products count
      db.product.count({
        where: { status: 'ACTIVE' }
      }),
      
      // Pending products count (using DRAFT status)
      db.product.count({
        where: { status: 'DRAFT' }
      })
    ])

    // Calculate total revenue
    const revenueResult = await db.order.aggregate({
      _sum: {
        total: true
      },
      where: {
        paymentStatus: 'COMPLETED'
      }
    })

    const totalRevenue = revenueResult._sum.total || 0

    // Get review statistics
    const [
      totalReviews,
      pendingReviews,
      approvedReviews
    ] = await Promise.all([
      db.review.count(),
      db.review.count({
        where: { status: 'PENDING' }
      }),
      db.review.count({
        where: { status: 'APPROVED' }
      })
    ])

    const stats = {
      totalUsers,
      totalVendors,
      pendingVendors,
      totalOrders,
      totalRevenue,
      totalProducts,
      activeProducts,
      pendingProducts,
      totalReviews,
      pendingReviews,
      approvedReviews
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}