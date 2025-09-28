"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Star,
  TrendingUp,
  Plus,
  Eye
} from "lucide-react"

interface VendorData {
  id: string
  businessName: string
  status: string
  totalSales: number
  totalOrders: number
  averageRating: number
  isActive: boolean
}

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
}

export default function VendorDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [vendorData, setVendorData] = useState<VendorData | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      if (session.user.role !== "VENDOR") {
        router.push("/")
        return
      }
      
      fetchVendorData()
    }
  }, [status, session, router])

  const fetchVendorData = async () => {
    try {
      const response = await fetch("/api/vendor/dashboard")
      if (response.ok) {
        const data = await response.json()
        setVendorData(data.vendor)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching vendor data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!vendorData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">No Vendor Account Found</CardTitle>
            <CardDescription className="text-center">
              You don't have a vendor account yet. Please apply to become a vendor.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/auth/vendor-apply">Apply as Vendor</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary", text: "Pending" },
      APPROVED: { variant: "default", text: "Approved" },
      REJECTED: { variant: "destructive", text: "Rejected" },
      SUSPENDED: { variant: "destructive", text: "Suspended" }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    
    return (
      <Badge variant={config.variant as any}>
        {config.text}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-900 mr-8">
                My Harvest Hub
              </Link>
              <span className="text-gray-600">Vendor Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {session?.user.name}</span>
              <Button asChild variant="outline" size="sm">
                <Link href="/">View Store</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{vendorData.businessName}</h1>
            <div className="flex items-center space-x-4 mt-2">
              {getStatusBadge(vendorData.status)}
              <span className="text-sm text-gray-500">
                {vendorData.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button asChild>
              <Link href="/vendor/products/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/vendor/profile">
                <Eye className="w-4 h-4 mr-2" />
                View Profile
              </Link>
            </Button>
          </div>
        </div>

        {/* Status Messages */}
        {vendorData.status === "PENDING" && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <div>
                  <h3 className="font-medium text-yellow-800">Application Under Review</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your vendor application is being reviewed by our team. We'll notify you once approved.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {vendorData.status === "APPROVED" && !vendorData.isActive && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div>
                  <h3 className="font-medium text-blue-800">Account Approved!</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Congratulations! Your vendor account has been approved. Add your first product to activate your store.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                  <p className="text-gray-600 text-sm">Products</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                  <p className="text-gray-600 text-sm">Total Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    ${stats.totalRevenue.toFixed(2)}
                  </p>
                  <p className="text-gray-600 text-sm">Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {vendorData.averageRating.toFixed(1)}
                  </p>
                  <p className="text-gray-600 text-sm">Avg Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manage your store and products
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/vendor/products">
                  <Package className="w-4 h-4 mr-2" />
                  Manage Products
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/vendor/orders">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  View Orders
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/vendor/analytics">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest store activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No recent activity</p>
                <p className="text-sm">Start by adding your first product!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}