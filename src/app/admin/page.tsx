'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Store, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  UserCheck,
  Package,
  Star
} from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  totalVendors: number
  pendingVendors: number
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  activeProducts: number
  pendingProducts: number
  totalReviews: number
  pendingReviews: number
  approvedReviews: number
}

interface RecentVendor {
  id: string
  businessName: string
  user: {
    name: string
    email: string
  }
  status: string
  createdAt: string
}

interface RecentOrder {
  id: string
  orderNumber: string
  total: number
  status: string
  customer: {
    name: string
    email: string
  }
  createdAt: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentVendors, setRecentVendors] = useState<RecentVendor[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return // Do nothing while loading
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    if (session && session.user.role !== 'ADMIN') {
      router.push('/')
    }
  }, [session, status, router])

  useEffect(() => {
    if (status === 'authenticated' && session?.user.role === 'ADMIN') {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, vendorsResponse, ordersResponse] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/vendors/recent'),
        fetch('/api/admin/orders/recent')
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (vendorsResponse.ok) {
        const vendorsData = await vendorsResponse.json()
        setRecentVendors(vendorsData.vendors || [])
      }

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setRecentOrders(ordersData.orders || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Show loading while session is being fetched
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Authenticating...</p>
        </div>
      </div>
    )
  }

  // Show error if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
          <p className="text-gray-600 mb-4">You need to sign in to access the admin dashboard.</p>
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access the admin dashboard.</p>
          <Button asChild>
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'PROCESSING': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {session.user.name}</span>
              <Button asChild variant="outline">
                <Link href="/">View Site</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Store className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Vendors</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalVendors}</p>
                  {stats.pendingVendors > 0 && (
                    <p className="text-xs text-yellow-600">{stats.pendingVendors} pending</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Package className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                  <p className="text-xs text-green-600">{stats.activeProducts} active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Star className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Customer Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReviews || 0}</p>
                  {stats.pendingReviews > 0 && (
                    <p className="text-xs text-yellow-600">{stats.pendingReviews} pending approval</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-full">
                <Button asChild className="w-full">
                  <Link href="/admin/reviews" className="flex items-center justify-center gap-2">
                    <Star className="w-4 h-4" />
                    Manage Reviews
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Vendor Applications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Recent Vendor Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentVendors.length > 0 ? (
                <div className="space-y-4">
                  {recentVendors.map((vendor) => (
                    <div key={vendor.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{vendor.businessName}</h4>
                        <p className="text-sm text-gray-600">{vendor.user.name} • {vendor.user.email}</p>
                        <p className="text-xs text-gray-500">
                          Applied {new Date(vendor.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(vendor.status)}>
                          {vendor.status}
                        </Badge>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/vendors/${vendor.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="text-center pt-4">
                    <Button asChild variant="outline">
                      <Link href="/admin/vendors">View All Vendors</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent vendor applications</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{order.orderNumber}</h4>
                        <p className="text-sm text-gray-600">{order.customer.name} • {order.customer.email}</p>
                        <p className="text-xs text-gray-500">
                          ${order.total.toFixed(2)} • {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getOrderStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="text-center pt-4">
                    <Button asChild variant="outline">
                      <Link href="/admin/orders">View All Orders</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent orders</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}