'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/utils'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCart()

  const handleCheckout = () => {
    window.location.href = '/checkout'
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-start justify-between p-4 border-b">
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
                      </Dialog.Title>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                          onClick={onClose}
                        >
                          <span className="absolute -inset-0.5" />
                          <span className="sr-only">Close panel</span>
                          <X className="h-6 w-6" />
                        </button>
                      </div>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 p-4">
                      {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <ShoppingBag className="w-12 h-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                          <p className="text-gray-500 text-center mb-6">
                            Browse our marketplace to find amazing products from local church vendors.
                          </p>
                          <Button asChild onClick={onClose}>
                            <Link href="/marketplace">
                              Continue Shopping
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {items.map((item) => (
                            <div key={item.id} className="flex items-center space-x-4">
                              <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                      {item.name}
                                    </h4>
                                    <p className="text-sm text-gray-500">by {item.vendorName}</p>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <span className="text-sm font-medium text-gray-900">
                                        {formatPrice(item.price)}
                                      </span>
                                      {item.comparePrice && item.comparePrice > item.price && (
                                        <span className="text-sm text-gray-500 line-through">
                                          {formatPrice(item.comparePrice)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => removeItem(item.productId)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex items-center space-x-2 mt-2">
                                  <button
                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="w-8 text-center text-sm font-medium">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                    disabled={item.quantity >= item.stockQuantity}
                                    className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>

                                {item.quantity >= item.stockQuantity && (
                                  <p className="text-xs text-orange-600 mt-1">
                                    Maximum stock reached
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Clear Cart Button */}
                          <div className="pt-4 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearCart}
                              className="w-full"
                            >
                              Clear Cart
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer with Total and Checkout */}
                    {items.length > 0 && (
                      <div className="border-t border-gray-200 p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-medium text-gray-900">Total</span>
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(getTotalPrice())}
                          </span>
                        </div>
                        <Button
                          onClick={handleCheckout}
                          className="w-full"
                          size="lg"
                        >
                          Proceed to Checkout
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          className="w-full"
                          onClick={onClose}
                        >
                          <Link href="/marketplace">
                            Continue Shopping
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}