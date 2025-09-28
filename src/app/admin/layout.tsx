import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard - Harvest Hub',
  description: 'Administrative dashboard for Harvest Hub marketplace',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}