'use client'

import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/CartContext'
import { CartDrawer } from './CartDrawer'

export function CartIcon() {
  const { getItemCount } = useCart()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const itemCount = getItemCount()

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsDrawerOpen(true)}
      >
        <ShoppingCart className="w-5 h-5" />
        {itemCount > 0 && (
          <Badge
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            variant="destructive"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </Badge>
        )}
      </Button>

      <CartDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </>
  )
}