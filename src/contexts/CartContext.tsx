'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  comparePrice?: number
  image: string
  vendorName: string
  vendorId: string
  quantity: number
  stockQuantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: any, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
  getTotalPrice: () => number
  isInCart: (productId: string) => boolean
  getCartItem: (productId: string) => CartItem | undefined
  isLoaded: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('myharvesthub-cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
    setMounted(true)
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('myharvesthub-cart', JSON.stringify(items))
    }
  }, [items, mounted])

  const addItem = (product: any, quantity = 1) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.productId === product.id)
      
      if (existingItem) {
        // Update quantity of existing item
        const newQuantity = Math.min(existingItem.quantity + quantity, product.stockQuantity)
        return currentItems.map(item =>
          item.productId === product.id
            ? { ...item, quantity: newQuantity }
            : item
        )
      } else {
        // Add new item to cart
        const newItem: CartItem = {
          id: `cart_${product.id}_${Date.now()}`,
          productId: product.id,
          name: product.name,
          price: product.comparePrice && product.comparePrice < product.price 
            ? product.comparePrice 
            : product.price,
          comparePrice: product.comparePrice,
          image: product.images?.find((img: any) => img.isPrimary)?.url || 
                 product.images?.[0]?.url || 
                 '/placeholder-product.jpg',
          vendorName: product.vendor?.businessName || 'Unknown Vendor',
          vendorId: product.vendor?.id || product.vendorId || '',
          quantity: Math.min(quantity, product.stockQuantity),
          stockQuantity: product.stockQuantity
        }
        return [...currentItems, newItem]
      }
    })
  }

  const removeItem = (productId: string) => {
    setItems(currentItems => currentItems.filter(item => item.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.productId === productId
          ? { ...item, quantity: Math.min(quantity, item.stockQuantity) }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const isInCart = (productId: string) => {
    return items.some(item => item.productId === productId)
  }

  const getCartItem = (productId: string) => {
    return items.find(item => item.productId === productId)
  }

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getTotalPrice,
    isInCart,
    getCartItem,
    isLoaded: mounted
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}