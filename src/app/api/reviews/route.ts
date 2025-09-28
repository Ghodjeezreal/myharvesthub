import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Get approved reviews for the product
    const reviews = await db.review.findMany({
      where: {
        productId,
        status: 'APPROVED'
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate stats
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews
      : 0

    // Calculate rating distribution
    const ratingDistribution = [0, 0, 0, 0, 0]
    reviews.forEach((review: any) => {
      ratingDistribution[review.rating - 1]++
    })

    return NextResponse.json({
      reviews,
      stats: {
        averageRating,
        totalReviews,
        ratingDistribution
      }
    })

  } catch (error) {
    console.error('Reviews fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { productId, rating, comment } = await request.json()

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Valid product ID and rating (1-5) are required' },
        { status: 400 }
      )
    }

    // Check if user has already reviewed this product
    const existingReview = await db.review.findFirst({
      where: {
        userId: session.user.id,
        productId
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      )
    }

    // Check if user has purchased this product (for verified reviews)
    const hasPurchased = await db.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: session.user.id,
          status: {
            in: ['DELIVERED', 'COMPLETED']
          }
        }
      }
    })

    const review = await db.review.create({
      data: {
        userId: session.user.id,
        productId,
        rating,
        comment,
        isVerified: !!hasPurchased,
        status: 'PENDING' // Reviews need admin approval
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({ 
      message: 'Review submitted successfully and is pending approval',
      review 
    })

  } catch (error) {
    console.error('Review submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}