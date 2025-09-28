"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Trash2,
  Package,
  AlertCircle
} from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  status: string
  stockQuantity: number
  images: { url: string; isPrimary: boolean }[]
  category: { name: string }
  createdAt: string
}

export default function VendorProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")

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
      
      fetchProducts()
    }
  }, [status, session, router])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/vendor/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const response = await fetch(`/api/vendor/products/${productId}`, {
        method: "DELETE"
      })
      
      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId))
      } else {
        alert("Failed to delete product")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Error deleting product")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { variant: "default", text: "Active" },
      DRAFT: { variant: "secondary", text: "Draft" },
      INACTIVE: { variant: "outline", text: "Inactive" },
      OUT_OF_STOCK: { variant: "destructive", text: "Out of Stock" }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT
    
    return (
      <Badge variant={config.variant as any}>
        {config.text}
      </Badge>
    )
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || product.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-xl font-bold text-blue-900">
                My Harvest Hub
              </Link>
              <Link href="/vendor/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <span className="text-blue-600 font-medium">Products</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {session?.user.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
            <p className="text-gray-600 mt-2">Manage your product listings</p>
          </div>
          <Button asChild>
            <Link href="/vendor/products/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => setStatusFilter("all")}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "ACTIVE" ? "default" : "outline"}
                  onClick={() => setStatusFilter("ACTIVE")}
                  size="sm"
                >
                  Active
                </Button>
                <Button
                  variant={statusFilter === "DRAFT" ? "default" : "outline"}
                  onClick={() => setStatusFilter("DRAFT")}
                  size="sm"
                >
                  Draft
                </Button>
                <Button
                  variant={statusFilter === "OUT_OF_STOCK" ? "default" : "outline"}
                  onClick={() => setStatusFilter("OUT_OF_STOCK")}
                  size="sm"
                >
                  Out of Stock
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery || statusFilter !== "all" ? "No products found" : "No products yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "Start by adding your first product to showcase your offerings"
                }
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button asChild>
                  <Link href="/vendor/products/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Product
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-square bg-gray-100 relative">
                  {product.images.find(img => img.isPrimary) ? (
                    <img
                      src={product.images.find(img => img.isPrimary)?.url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(product.status)}
                  </div>
                  {product.stockQuantity <= 5 && product.status === "ACTIVE" && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Low Stock
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 truncate" title={product.name}>
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500">{product.category.name}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-lg">{formatPrice(product.price)}</span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.comparePrice)}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      Stock: {product.stockQuantity}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={`/products/${product.slug}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={`/vendor/products/${product.id}/edit`}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {products.length}
                </div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.status === "ACTIVE").length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {products.filter(p => p.status === "DRAFT").length}
                </div>
                <div className="text-sm text-gray-600">Draft</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {products.filter(p => p.stockQuantity <= 5 && p.status === "ACTIVE").length}
                </div>
                <div className="text-sm text-gray-600">Low Stock</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}