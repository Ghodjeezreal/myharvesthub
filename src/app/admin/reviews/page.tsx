'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AdminHeader } from '@/components/AdminHeader'
import { Star, User, Package } from 'lucide-react'

interface Review {
  id: string
  rating: number
  comment: string | null
  status: string
  isVerified: boolean
  createdAt: string
  user: {
    name: string
    email: string
  }
  product: {
    name: string
    vendor: {
      businessName: string
    }
  }
}

export default function AdminReviewsPage() {
  const { data: session, status } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('PENDING')

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
      return
    }
    if (!session || session.user.role !== 'ADMIN') {
      redirect('/')
      return
    }
    fetchReviews()
  }, [session, status, selectedStatus])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/admin/reviews?status=${selectedStatus}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateReviewStatus = async (reviewId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setReviews(reviews.map(review => 
          review.id === reviewId ? { ...review, status: newStatus } : review
        ))
      }
    } catch (error) {
      console.error('Error updating review status:', error)
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Authenticating...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <AdminHeader />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
          
          <div className="flex gap-2">
            {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(status => (
              <Button
                key={status}
                variant={selectedStatus === status ? 'default' : 'outline'}
                onClick={() => setSelectedStatus(status)}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          {reviews.map(review => (
            <Card key={review.id} className="p-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold">
                  Review #{review.id.slice(-6)}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    review.status === 'APPROVED' ? 'default' :
                    review.status === 'REJECTED' ? 'destructive' : 'outline'
                  }>
                    {review.status}
                  </Badge>
                  {review.isVerified && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Verified Purchase
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-700">Customer</h4>
                      <p className="text-sm text-gray-600">{review.user.name}</p>
                      <p className="text-sm text-gray-600">{review.user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Package className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-700">Product</h4>
                      <p className="text-sm text-gray-600">{review.product.name}</p>
                      <p className="text-sm text-gray-500">by {review.product.vendor.businessName}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Rating & Date</h4>
                    <div className="flex items-center space-x-2 mb-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-600">({review.rating}/5)</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {review.comment && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Comment</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                )}

                {review.status === 'PENDING' && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => updateReviewStatus(review.id, 'APPROVED')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => updateReviewStatus(review.id, 'REJECTED')}
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                    >
                      Reject
                    </Button>
                  </div>
                )}

                {review.status !== 'PENDING' && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => updateReviewStatus(review.id, 'APPROVED')}
                      variant={review.status === 'APPROVED' ? 'default' : 'outline'}
                    >
                      {review.status === 'APPROVED' ? 'Approved ✓' : 'Approve'}
                    </Button>
                    <Button
                      onClick={() => updateReviewStatus(review.id, 'REJECTED')}
                      variant={review.status === 'REJECTED' ? 'destructive' : 'outline'}
                    >
                      {review.status === 'REJECTED' ? 'Rejected' : 'Reject'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {reviews.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No reviews found for the selected status.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}