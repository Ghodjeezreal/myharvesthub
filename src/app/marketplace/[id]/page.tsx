'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Star, MapPin, Clock, Heart, ShoppingCart, Share2 } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { ReviewList } from '@/components/reviews/ReviewList'

interface ProductImage {
  id: string
  url: string
  isPrimary: boolean
}

interface Vendor {
  id: string
  businessName: string
  businessType: string
  businessAddress: string | null
  user: {
    name: string
    image: string | null
  }
}

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  shortDesc: string | null
  description: string
  price: number
  comparePrice: number | null
  stockQuantity: number
  status: string
  tags: string | null
  createdAt: string
  images: ProductImage[]
  vendor: Vendor
  category: Category
  _count: {
    reviews: number
  }
  averageRating: number
}

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: {
    name: string
    image: string | null
  }
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem, isInCart, getCartItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0)

  const inCart = product ? isInCart(product.id) : false
  const cartItem = product ? getCartItem(product.id) : undefined

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`)
        if (!response.ok) {
          throw new Error('Product not found')
        }
        const data = await response.json()
        setProduct(data.product)
        setReviews(data.reviews || [])
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity)
      // Reset quantity to 1 after adding
      setQuantity(1)
    }
  }

  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    // TODO: Implement wishlist functionality
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.shortDesc || '',
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Product link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The product you\'re looking for doesn\'t exist.'}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0]
  const hasDiscount = product.comparePrice && product.comparePrice > product.price

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Marketplace
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleWishlist}
                className={isWishlisted ? "text-red-600" : "text-gray-600"}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm">
              <Image
                src={product.images[selectedImage]?.url || '/placeholder-product.jpg'}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-white rounded-lg overflow-hidden shadow-sm border-2 ${
                      selectedImage === index ? 'border-blue-600' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.name} view ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{product.category.name}</Badge>
                <Badge 
                  variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}
                >
                  {product.status}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              {product.shortDesc && (
                <p className="text-lg text-gray-600 mb-4">{product.shortDesc}</p>
              )}
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.averageRating.toFixed(1)} ({product._count.reviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-blue-600">
                  ${product.price}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-gray-500 line-through">
                    ${product.comparePrice}
                  </span>
                )}
              </div>

              {/* Stock Info */}
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {product.stockQuantity > 0 
                    ? `${product.stockQuantity} in stock` 
                    : 'Out of stock'
                  }
                </span>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <label htmlFor="quantity" className="text-sm font-medium">
                  Quantity:
                </label>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max={product.stockQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 px-2 py-2 text-center border-0 focus:ring-0"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                    disabled={quantity >= product.stockQuantity}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <Button
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0 || (inCart && cartItem && (cartItem.quantity + quantity) > product.stockQuantity)}
                className="w-full mb-4"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.stockQuantity === 0 
                  ? 'Out of Stock' 
                  : inCart 
                    ? `Add More (${cartItem?.quantity} in cart)`
                    : 'Add to Cart'
                }
              </Button>

              {/* Tags */}
              {product.tags && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900">Tags:</h3>
                  <div className="flex flex-wrap gap-1">
                    {product.tags.split(',').map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vendor Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {product.vendor.user.image ? (
                <Image
                  src={product.vendor.user.image}
                  alt={product.vendor.businessName}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {product.vendor.businessName[0]}
                </div>
              )}
              <div>
                <h3 className="font-bold">{product.vendor.businessName}</h3>
                <p className="text-sm text-gray-600 font-normal">{product.vendor.businessType}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {product.vendor.businessAddress && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                {product.vendor.businessAddress}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Description */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Product Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        {/* Reviews Section */}
        <div className="space-y-6">
          <ReviewForm 
            productId={product.id} 
            onReviewSubmitted={() => setReviewRefreshTrigger(prev => prev + 1)}
          />
          <ReviewList 
            productId={product.id}
            refreshTrigger={reviewRefreshTrigger}
          />
        </div>
      </div>
    </div>
  )
}