'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useState } from 'react'

export function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-gradient-to-r from-purple-700 to-purple-800 text-white py-2 px-4 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
        <div className="flex items-center gap-2 text-sm md:text-base">
          <span className="font-medium">FREE delivery on orders ≥/= 50K.</span>
          <Button 
            variant="secondary" 
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-white border-0 text-xs px-3 py-1"
          >
            <Link href="/marketplace">Shop Now</Link>
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:text-purple-200 hover:bg-purple-600 p-1 h-auto"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}