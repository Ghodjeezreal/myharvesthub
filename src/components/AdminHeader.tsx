import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function AdminHeader() {
  return (
    <nav className="bg-white shadow-sm mb-8">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex space-x-4">
            <Link href="/admin">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link href="/admin/vendors">
              <Button variant="outline">Vendors</Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="outline">Orders</Button>
            </Link>
            <Link href="/admin/reviews">
              <Button variant="outline">Reviews</Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="outline">Analytics</Button>
            </Link>
            <Link href="/">
              <Button variant="default">Back to Site</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}