'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, ThumbsUp, Flag } from 'lucide-react'

interface Review {
  id: string
  rating: number
  comment: string | null
  status: string
  isVerified: boolean
  createdAt: string
  user: {
    name: string
  }
}

interface ReviewListProps {
  productId: string
  refreshTrigger?: number
}

export function ReviewList({ productId, refreshTrigger }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: [0, 0, 0, 0, 0]
  })

  useEffect(() => {
    fetchReviews()
  }, [productId, refreshTrigger])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${productId}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const renderRatingDistribution = () => {
    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 w-8">{rating}★</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full"
                style={{
                  width: `${
                    stats.totalReviews > 0
                      ? (stats.ratingDistribution[rating - 1] / stats.totalReviews) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
            <span className="text-sm text-gray-600 w-8">
              {stats.ratingDistribution[rating - 1]}
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return <div>Loading reviews...</div>
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {stats.averageRating.toFixed(1)}
              </div>
              {renderStars(Math.round(stats.averageRating))}
              <p className="text-gray-600 mt-2">
                Based on {stats.totalReviews} reviews
              </p>
            </div>
            <div>{renderRatingDistribution()}</div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No reviews yet. Be the first to leave a review!</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {review.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{review.user.name}</span>
                        {review.isVerified && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {review.status === 'PENDING' && (
                      <Badge variant="outline">Pending Approval</Badge>
                    )}
                    <Button variant="ghost" size="sm">
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {review.comment && (
                  <div className="text-gray-700 leading-relaxed">
                    {review.comment}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}