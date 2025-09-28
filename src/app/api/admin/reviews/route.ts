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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'

    // Get reviews by status
    const reviews = await db.review.findMany({
      where: status === 'ALL' ? {} : { status },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        product: {
          select: {
            name: true,
            vendor: {
              select: {
                businessName: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ reviews })

  } catch (error) {
    console.error('Admin reviews fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}