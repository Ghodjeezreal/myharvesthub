"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Store, Users, Star } from "lucide-react"
import { HeroSlider } from "@/components/hero/HeroSlider"

export default function Home() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Features */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8 md:mb-12">
            Why Choose My Harvest Hub?
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <Card className="text-center">
              <CardHeader>
                <Heart className="w-10 h-10 md:w-12 md:h-12 text-red-500 mx-auto mb-4" />
                <CardTitle className="text-lg md:text-xl">Faith-Based Community</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm md:text-base">
                  Shop with confidence knowing you're supporting businesses owned by fellow church members 
                  who share your values and faith.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Store className="w-10 h-10 md:w-12 md:h-12 text-blue-500 mx-auto mb-4" />
                <CardTitle className="text-lg md:text-xl">Quality Products & Services</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm md:text-base">
                  Discover unique, high-quality products and services from handmade crafts to professional services, 
                  all backed by Christian business ethics.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="w-10 h-10 md:w-12 md:h-12 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-lg md:text-xl">Strong Community Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm md:text-base">
                  Every purchase helps strengthen our church community and supports the dreams and 
                  livelihoods of our fellow believers.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8 md:mb-12">
            Popular Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-lg md:text-2xl">🎨</span>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm md:text-base">Handmade Crafts</h3>
              <p className="text-gray-600 text-xs md:text-sm mt-1 md:mt-2">Unique, handcrafted items made with love</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-lg md:text-2xl">🍞</span>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm md:text-base">Baked Goods</h3>
              <p className="text-gray-600 text-xs md:text-sm mt-1 md:mt-2">Fresh, homemade treats and specialties</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-lg md:text-2xl">💼</span>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm md:text-base">Professional Services</h3>
              <p className="text-gray-600 text-xs md:text-sm mt-1 md:mt-2">Expert services from trusted members</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-lg md:text-2xl">👕</span>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm md:text-base">Faith-Based Apparel</h3>
              <p className="text-gray-600 text-xs md:text-sm mt-1 md:mt-2">Clothing that expresses your faith</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8 md:mb-12">
            What Our Community Says
          </h2>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <Card>
              <CardContent className="pt-4 md:pt-6">
                <div className="flex items-center mb-3 md:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-3 md:mb-4 text-sm md:text-base">
                  "I love being able to support fellow church members while getting amazing products. 
                  The quality is excellent and knowing the story behind each business makes shopping here so meaningful."
                </p>
                <p className="font-semibold text-gray-900 text-sm md:text-base">- Sarah M., Church Customer</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 md:pt-6">
                <div className="flex items-center mb-3 md:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-3 md:mb-4 text-sm md:text-base">
                  "As a vendor, this platform has helped me connect with my church community in a new way. 
                  It's wonderful to share my passion for baking while building relationships with fellow believers."
                </p>
                <p className="font-semibold text-gray-900 text-sm md:text-base">- David L., Vendor</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-lg font-semibold mb-4">My Harvest Hub</h3>
              <p className="text-gray-400 text-sm">
                Building community through faith-based commerce.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/marketplace" className="hover:text-white">Shop</Link></li>
                <li><Link href="/vendors" className="hover:text-white">Vendors</Link></li>
                <li><Link href="/about" className="hover:text-white">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">For Vendors</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/auth/vendor-apply" className="hover:text-white">Apply Now</Link></li>
                <li><Link href="/vendor-resources" className="hover:text-white">Resources</Link></li>
                <li><Link href="/support" className="hover:text-white">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 My Harvest Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
