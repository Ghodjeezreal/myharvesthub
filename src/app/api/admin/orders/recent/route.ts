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

    // Get recent orders
    const orders = await db.order.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true
              }
            }
          }
        }
      }
    })

    const formattedOrders = orders.map((order: any) => ({
      id: order.id,
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      total: order.total,
      status: order.status,
      itemCount: order.items.length,
      createdAt: order.createdAt
    }))

    return NextResponse.json({ orders: formattedOrders })

  } catch (error) {
    console.error('Recent orders error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}