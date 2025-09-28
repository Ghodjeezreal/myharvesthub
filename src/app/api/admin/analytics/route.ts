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

    // Calculate date ranges
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Get total stats
    const [totalOrders, totalRevenue, totalUsers, totalVendors] = await Promise.all([
      db.order.count(),
      db.order.aggregate({
        _sum: { totalAmount: true }
      }),
      db.user.count(),
      db.vendor.count({
        where: { status: 'APPROVED' }
      })
    ])

    // Get growth metrics
    const [ordersLastMonth, revenueLastMonth] = await Promise.all([
      db.order.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
            lt: now
          }
        }
      }),
      db.order.aggregate({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
            lt: now
          }
        },
        _sum: { totalAmount: true }
      })
    ])

    const [ordersPreviousMonth, revenuePreviousMonth] = await Promise.all([
      db.order.count({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo
          }
        }
      }),
      db.order.aggregate({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo
          }
        },
        _sum: { totalAmount: true }
      })
    ])

    // Calculate growth percentages
    const orderGrowth = ordersPreviousMonth > 0 
      ? Math.round(((ordersLastMonth - ordersPreviousMonth) / ordersPreviousMonth) * 100)
      : 0

    const revenueGrowth = revenuePreviousMonth._sum.totalAmount > 0
      ? Math.round(((revenueLastMonth._sum.totalAmount - revenuePreviousMonth._sum.totalAmount) / revenuePreviousMonth._sum.totalAmount) * 100)
      : 0

    // Get top vendors
    const topVendors = await db.vendor.findMany({
      where: { status: 'APPROVED' },
      take: 5,
      include: {
        products: {
          include: {
            orderItems: {
              include: {
                order: true
              }
            }
          }
        }
      }
    })

    const vendorStats = topVendors.map((vendor: any) => {
      const revenue = vendor.products.reduce((total: number, product: any) => {
        return total + product.orderItems.reduce((productTotal: number, item: any) => {
          return productTotal + (item.quantity * item.price)
        }, 0)
      }, 0)

      const orders = vendor.products.reduce((total: number, product: any) => {
        return total + product.orderItems.length
      }, 0)

      return {
        businessName: vendor.businessName,
        revenue,
        orders
      }
    }).sort((a: any, b: any) => b.revenue - a.revenue)

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalOrders,
      totalVendors,
      totalUsers,
      revenueGrowth: revenueGrowth || 0,
      orderGrowth: orderGrowth || 0,
      topVendors: vendorStats
    })

  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}