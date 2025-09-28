import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Fetch product with all related data
    const product = await db.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        shortDesc: true,
        description: true,
        price: true,
        comparePrice: true,
        stockQuantity: true,
        status: true,
        tags: true,
        createdAt: true,
        images: {
          select: {
            id: true,
            url: true,
            isPrimary: true
          },
          orderBy: { isPrimary: 'desc' }
        },
        vendor: {
          select: {
            id: true,
            businessName: true,
            businessType: true,
            businessAddress: true,
            user: {
              select: {
                name: true,
                image: true
              }
            }
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Calculate average rating
    const reviewStats = await db.review.aggregate({
      where: { productId: id },
      _avg: {
        rating: true
      }
    })

    // Fetch recent reviews
    const reviews = await db.review.findMany({
      where: { productId: id },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const productWithRating = {
      ...product,
      averageRating: reviewStats._avg.rating || 0
    }

    return NextResponse.json({
      product: productWithRating,
      reviews
    })

  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}