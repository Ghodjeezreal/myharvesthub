'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

function SuccessPageContent() {
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const [orderDetails, setOrderDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const reference = searchParams.get('reference')

  useEffect(() => {
    // Clear the cart after successful payment
    clearCart()

    if (reference) {
      console.log('Payment successful with reference:', reference)
    }
    
    setLoading(false)
  }, [clearCart, reference])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your order...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Order Confirmation</h3>
                  <p className="text-sm text-gray-600">
                    You'll receive an email confirmation with your order details shortly.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Processing</h3>
                  <p className="text-sm text-gray-600">
                    Our church vendors will prepare your items with care and love.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Shipping</h3>
                  <p className="text-sm text-gray-600">
                    You'll receive tracking information once your order ships.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Have questions about your order? Contact us at support@myharvesthub.com
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href="/marketplace">
                Continue Shopping
              </Link>
            </Button>
            <Button asChild>
              <Link href="/orders" className="flex items-center gap-2">
                View Your Orders
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>

        {reference && (
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Payment Reference: {reference}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading success page...</p>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  )
}