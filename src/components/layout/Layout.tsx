'use client'

import { PromoBanner } from './PromoBanner'
import { MainHeader } from './MainHeader'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PromoBanner />
      <MainHeader />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}