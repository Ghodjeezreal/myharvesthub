"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  Star,
  Heart,
  ShoppingCart,
  Package
} from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { useCart } from "@/contexts/CartContext"
import { MarketplaceHero } from "@/components/hero/MarketplaceHero"

interface Product {
  id: string
  name: string
  shortDesc?: string
  price: number
  comparePrice?: number
  stockQuantity?: number
  images: { url: string; isPrimary: boolean }[]
  vendor: {
    businessName: string
    averageRating: number
  }
  category: { name: string }
  _count: { reviews: number }
}

interface Category {
  id: string
  name: string
  slug: string
  _count: { products: number }
}

export default function MarketplacePage() {
  const { data: session } = useSession()
  const { addItem, isInCart, getCartItem } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
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

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search functionality is already handled by the filteredAndSortedProducts logic
  }

  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.shortDesc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategory === "all" || 
                             product.category.name.toLowerCase() === selectedCategory.toLowerCase()
      
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "rating":
          return b.vendor.averageRating - a.vendor.averageRating
        case "reviews":
          return b._count.reviews - a._count.reviews
        default: // newest
          return 0 // Since we're not storing createdAt in the fetched data
      }
    })

  const ProductCard = ({ product }: { product: Product }) => {
    const inCart = isInCart(product.id)
    const cartItem = getCartItem(product.id)

    const handleAddToCart = (e: React.MouseEvent) => {
      e.preventDefault() // Prevent navigation to product detail
      addItem(product, 1)
    }

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
        <Link href={`/marketplace/${product.id}`}>
          <div className="aspect-square bg-gray-100 relative overflow-hidden">
            {product.images.find(img => img.isPrimary) ? (
              <img
                src={product.images.find(img => img.isPrimary)?.url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-300" />
              </div>
            )}
          </div>
        </Link>
        
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="secondary" className="rounded-full h-8 w-8 p-0">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
        {product.comparePrice && product.comparePrice > product.price && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold text-sm px-3 py-1 shadow-lg">
              SALE
            </Badge>
          </div>
        )}
        
        <CardContent className="p-4">
          <div className="mb-2">
            <Link href={`/marketplace/${product.id}`} className="hover:underline">
              <h3 className="font-semibold text-gray-900 truncate" title={product.name}>
                {product.name}
              </h3>
            </Link>
            <p className="text-sm text-gray-600">by {product.vendor.businessName}</p>
          </div>
          
          {product.shortDesc && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.shortDesc}
            </p>
          )}
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg">{formatPrice(product.price)}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{product.vendor.averageRating.toFixed(1)}</span>
              <span>({product._count.reviews})</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/marketplace/${product.id}`}>
                View Details
              </Link>
            </Button>
            <Button 
              size="sm" 
              className="flex-1"
              onClick={handleAddToCart}
              disabled={inCart && cartItem && cartItem.quantity >= (product.stockQuantity || 0)}
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              {inCart ? `In Cart (${cartItem?.quantity})` : 'Add to Cart'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Marketplace Hero */}
      <MarketplaceHero 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Filters and Controls */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm min-w-48"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name} ({category._count.products})
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm min-w-48"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviews</option>
              </select>

              <div className="flex-1"></div>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {filteredAndSortedProducts.length} products found
            {selectedCategory !== "all" && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery || selectedCategory !== "all" ? "No products found" : "No products available"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedCategory !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "Check back soon as our vendors add their products"
                }
              </p>
              {!searchQuery && selectedCategory === "all" && (
                <Button asChild>
                  <Link href="/auth/vendor-apply">
                    Become a Vendor
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          }`}>
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}