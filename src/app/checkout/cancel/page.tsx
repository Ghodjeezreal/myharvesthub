'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { XCircle, ShoppingCart, ArrowLeft, RefreshCw } from 'lucide-react'

export default function CheckoutCancelPage() {
  useEffect(() => {
    // You could track checkout abandonment here
    console.log('Checkout was cancelled')
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Checkout Cancelled
          </h1>
          <p className="text-lg text-gray-600">
            Your order was not completed. Your cart items are still saved.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What would you like to do?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <ShoppingCart className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Return to Cart</h3>
                  <p className="text-sm text-gray-600">
                    Review your items and try checkout again.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Continue Shopping</h3>
                  <p className="text-sm text-gray-600">
                    Browse more products from our church vendors.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Need help with your order? Contact us at support@myharvesthub.com
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" className="flex items-center gap-2">
              <Link href="/marketplace">
                <ArrowLeft className="w-4 h-4" />
                Back to Marketplace
              </Link>
            </Button>
            <Button asChild className="flex items-center gap-2">
              <Link href="/checkout">
                <ShoppingCart className="w-4 h-4" />
                Try Checkout Again
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-2">
            Supporting Our Church Community
          </h3>
          <p className="text-sm text-blue-800">
            Every purchase on My Harvest Hub supports local church businesses and helps strengthen our faith community. 
            Your cart items are still saved and ready when you are!
          </p>
        </div>
      </div>
    </div>
  )
}