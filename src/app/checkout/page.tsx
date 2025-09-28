'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CreditCard, Lock, Truck, MapPin } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/utils'

// Paystack types
declare global {
  interface Window {
    PaystackPop: {
      setup: (options: PaystackConfig) => {
        openIframe: () => void
      }
    }
  }
}

interface PaystackConfig {
  key: string
  email: string
  amount: number
  currency: string
  ref: string
  firstname: string
  lastname: string
  phone: string
  callback: (response: any) => void
  onClose: () => void
}

interface ShippingAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { items, getTotalPrice, clearCart, isLoaded } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: session?.user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  })

  // Redirect if cart is empty (only after cart is loaded)
  useEffect(() => {
    if (isLoaded && items.length === 0) {
      router.push('/marketplace')
    }
  }, [items, router, isLoaded])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/checkout')
    }
  }, [status, router])

  const subtotal = getTotalPrice()
  const tax = subtotal * 0.08 // 8% tax
  const shipping = subtotal > 50 ? 0 : 9.99 // Free shipping over $50
  const total = subtotal + tax + shipping

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCheckout = async () => {
    try {
      setIsLoading(true)

      // Validate form
      const requiredFields: (keyof ShippingAddress)[] = [
        'firstName', 'lastName', 'email', 'address', 'city', 'state', 'zipCode'
      ]
      
      for (const field of requiredFields) {
        if (!shippingAddress[field].trim()) {
          alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
          return
        }
      }

      // Create order and get Paystack details
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            vendorId: item.vendorId
          })),
          shippingAddress,
          totals: {
            subtotal,
            tax,
            shipping,
            total
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const paymentData = await response.json()

      // Initialize Paystack payment
      if (window.PaystackPop) {
        const handler = window.PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
          email: paymentData.email,
          amount: paymentData.amount, // Amount in kobo
          currency: 'NGN',
          ref: paymentData.reference,
          firstname: shippingAddress.firstName,
          lastname: shippingAddress.lastName,
          phone: shippingAddress.phone,
          callback: function(response) {
            // Payment successful
            alert('Payment successful! Reference: ' + response.reference)
            clearCart()
            router.push(`/checkout/success?reference=${response.reference}`)
          },
          onClose: function() {
            // Payment cancelled
            alert('Payment was cancelled')
            setIsLoading(false)
          }
        })
        
        handler.openIframe()
      } else {
        throw new Error('Paystack not loaded')
      }

    } catch (error) {
      console.error('Checkout error:', error)
      alert('There was an error processing your order. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!session || items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  // Group items by vendor
  const itemsByVendor = items.reduce((groups, item) => {
    if (!groups[item.vendorId]) {
      groups[item.vendorId] = {
        vendorName: item.vendorName,
        items: []
      }
    }
    groups[item.vendorId].items.push(item)
    return groups
  }, {} as Record<string, { vendorName: string; items: typeof items }>)

  // Show loading while session is being checked or if not authenticated
  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will be redirected)
  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cart
            </Button>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Shipping & Payment */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <Input
                      id="firstName"
                      value={shippingAddress.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <Input
                      id="lastName"
                      value={shippingAddress.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input
                    id="email"
                    type="email"
                    value={shippingAddress.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <Input
                    id="phone"
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <Input
                    id="address"
                    value={shippingAddress.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <Input
                      id="zipCode"
                      value={shippingAddress.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <Input
                      id="country"
                      value={shippingAddress.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      disabled
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">
                    Payment will be processed securely via Stripe
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  You'll be redirected to Stripe's secure checkout to complete your payment.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(itemsByVendor).map(([vendorId, vendorGroup]) => (
                    <div key={vendorId} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{vendorGroup.vendorName}</span>
                      </div>
                      
                      {vendorGroup.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 pl-6">
                          <div className="relative w-12 h-12 bg-gray-100 rounded-md overflow-hidden">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity} × {formatPrice(item.price)}
                            </p>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Totals */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">
                      {shipping === 0 ? 'Free' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">{formatPrice(tax)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-medium">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full mt-6"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Complete Order
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  By placing your order, you agree to our Terms of Service and Privacy Policy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
