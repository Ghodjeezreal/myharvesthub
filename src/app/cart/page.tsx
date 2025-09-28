'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft,
  Package,
  CreditCard
} from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice, getItemCount, clearCart } = useCart()

  const subtotal = getTotalPrice()
  const tax = subtotal * 0.08 // 8% tax
  const shipping = subtotal > 50 ? 0 : 9.99 // Free shipping over $50
  const total = subtotal + tax + shipping

  const handleQuantityChange = (productId: string, newQuantity: number, maxStock: number) => {
    if (newQuantity < 1) {
      removeItem(productId)
    } else if (newQuantity <= maxStock) {
      updateQuantity(productId, newQuantity)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/marketplace" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>

          {/* Empty Cart */}
          <Card>
            <CardContent className="text-center py-16">
              <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-gray-300" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Looks like you haven't added any products to your cart yet. 
                Start shopping to fill it up!
              </p>
              <Button size="lg" asChild>
                <Link href="/marketplace">
                  Start Shopping
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/marketplace" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-600">{getItemCount()} {getItemCount() === 1 ? 'item' : 'items'}</p>
            </div>
          </div>
          
          {items.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if (confirm('Are you sure you want to clear your cart?')) {
                  clearCart()
                }
              }}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cart
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Product Image */}
                        <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-300" />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {item.name}
                              </h3>
                              <p className="text-sm text-gray-600">by {item.vendorName}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-lg font-bold text-gray-900">
                                  {formatPrice(item.price)}
                                </span>
                                {item.comparePrice && item.comparePrice > item.price && (
                                  <>
                                    <span className="text-sm text-gray-500 line-through">
                                      {formatPrice(item.comparePrice)}
                                    </span>
                                    <Badge className="bg-red-500 text-white text-xs">
                                      Sale
                                    </Badge>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Remove Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.productId)}
                              className="text-red-600 hover:text-red-700 ml-4"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 mt-4">
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuantityChange(item.productId, item.quantity - 1, item.stockQuantity)}
                                className="h-10 w-10 p-0 rounded-r-none border-r"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              
                              <div className="w-16 text-center py-2 font-medium">
                                {item.quantity}
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuantityChange(item.productId, item.quantity + 1, item.stockQuantity)}
                                disabled={item.quantity >= item.stockQuantity}
                                className="h-10 w-10 p-0 rounded-l-none border-l"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <span className="text-sm text-gray-600">
                              {item.stockQuantity} available
                            </span>
                            
                            {item.quantity >= item.stockQuantity && (
                              <Badge variant="secondary" className="text-xs">
                                Max quantity
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({getItemCount()} items)</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (8%)</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  
                  {subtotal < 50 && (
                    <p className="text-xs text-gray-500">
                      Add {formatPrice(50 - subtotal)} more for free shipping
                    </p>
                  )}
                </div>

                <div className="border-t my-4"></div>
                
                <div className="flex justify-between text-lg font-semibold text-gray-900 mb-6">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <Button size="lg" className="w-full" asChild>
                  <Link href="/checkout" className="flex items-center justify-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Proceed to Checkout
                  </Link>
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Secure checkout powered by Paystack
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}