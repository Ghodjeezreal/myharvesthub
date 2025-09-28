"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Eye } from "lucide-react"
import { generateSlug } from "@/lib/utils"

interface Category {
  id: string
  name: string
}

interface FormData {
  name: string
  description: string
  shortDesc: string
  price: string
  comparePrice: string
  categoryId: string
  stockQuantity: string
  sku: string
  tags: string
  isDigital: boolean
  weight: string
  dimensions: string
  status: "DRAFT" | "ACTIVE"
}

export default function AddProductPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    shortDesc: "",
    price: "",
    comparePrice: "",
    categoryId: "",
    stockQuantity: "0",
    sku: "",
    tags: "",
    isDigital: false,
    weight: "",
    dimensions: "",
    status: "DRAFT"
  })

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
      
      fetchCategories()
    }
  }, [status, session, router])

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent, saveStatus: "DRAFT" | "ACTIVE") => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    // Validation
    if (!formData.name || !formData.price || !formData.categoryId) {
      setError("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    if (parseFloat(formData.price) <= 0) {
      setError("Price must be greater than 0")
      setIsSubmitting(false)
      return
    }

    if (saveStatus === "ACTIVE" && (!formData.description || parseInt(formData.stockQuantity) < 0)) {
      setError("Description and valid stock quantity are required for active products")
      setIsSubmitting(false)
      return
    }

    try {
      const productData = {
        name: formData.name,
        slug: generateSlug(formData.name),
        description: formData.description,
        shortDesc: formData.shortDesc,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
        categoryId: formData.categoryId,
        stockQuantity: parseInt(formData.stockQuantity),
        sku: formData.sku,
        tags: formData.tags,
        isDigital: formData.isDigital,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions: formData.dimensions,
        status: saveStatus
      }

      const response = await fetch("/api/vendor/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        router.push("/vendor/products")
      } else {
        const data = await response.json()
        setError(data.message || "An error occurred")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === "loading") {
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
              <Link href="/vendor/products" className="text-gray-600 hover:text-gray-900">
                Products
              </Link>
              <span className="text-blue-600 font-medium">Add Product</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {session?.user.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="outline" size="sm">
            <Link href="/vendor/products">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-gray-600 mt-2">Create a new product listing for your store</p>
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Enter the basic details about your product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Short Description
                    </label>
                    <Input
                      name="shortDesc"
                      value={formData.shortDesc}
                      onChange={handleInputChange}
                      placeholder="Brief description for listings"
                      maxLength={100}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.shortDesc.length}/100 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Description
                    </label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Detailed product description..."
                      rows={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <Input
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="handmade, spiritual, gift (comma-separated)"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Separate tags with commas to help customers find your product
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                  <CardDescription>
                    Set your product pricing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price *
                      </label>
                      <Input
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Compare Price
                      </label>
                      <Input
                        name="comparePrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.comparePrice}
                        onChange={handleInputChange}
                        placeholder="0.00"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Show original price for sales
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inventory */}
              <Card>
                <CardHeader>
                  <CardTitle>Inventory & Shipping</CardTitle>
                  <CardDescription>
                    Track inventory and shipping details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock Quantity *
                      </label>
                      <Input
                        name="stockQuantity"
                        type="number"
                        min="0"
                        value={formData.stockQuantity}
                        onChange={handleInputChange}
                        placeholder="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKU
                      </label>
                      <Input
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        placeholder="Product SKU"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isDigital"
                      name="isDigital"
                      checked={formData.isDigital}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 mr-2"
                    />
                    <label htmlFor="isDigital" className="text-sm text-gray-700">
                      This is a digital product (no shipping required)
                    </label>
                  </div>

                  {!formData.isDigital && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Weight (lbs)
                        </label>
                        <Input
                          name="weight"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.weight}
                          onChange={handleInputChange}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dimensions
                        </label>
                        <Input
                          name="dimensions"
                          value={formData.dimensions}
                          onChange={handleInputChange}
                          placeholder="L x W x H"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Category</CardTitle>
                  <CardDescription>
                    Choose the category for your product
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Publish</CardTitle>
                  <CardDescription>
                    Choose how to save your product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <Button
                    onClick={(e) => handleSubmit(e, "DRAFT")}
                    disabled={isSubmitting}
                    variant="outline"
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save as Draft
                  </Button>

                  <Button
                    onClick={(e) => handleSubmit(e, "ACTIVE")}
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Publish Product
                  </Button>

                  <p className="text-sm text-gray-500">
                    Draft products are not visible to customers. Published products will appear in your store.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}