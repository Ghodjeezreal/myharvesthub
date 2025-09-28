'use client'

import { Search, Filter, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'

interface MarketplaceHeroProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  onSearch: (e: React.FormEvent) => void
}

export function MarketplaceHero({ searchQuery, setSearchQuery, onSearch }: MarketplaceHeroProps) {
  return (
    <section className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Faith-Based Marketplace
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Discover Amazing
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              Products & Services
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Support fellow church members while finding unique, high-quality products 
            and services backed by Christian values
          </p>

          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={onSearch} className="relative">
              <div className="flex">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search for products, services, or vendors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-lg bg-white border-0 focus:ring-2 focus:ring-yellow-400 rounded-l-xl text-gray-900"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-8 py-4 text-lg rounded-r-xl border-0"
                >
                  Search
                </Button>
              </div>
            </form>
            
            {/* Popular Searches */}
            <div className="mt-4 text-sm text-blue-100">
              <span className="mr-2">Popular:</span>
              <button className="hover:text-white mr-3 underline">Handmade Crafts</button>
              <button className="hover:text-white mr-3 underline">Baked Goods</button>
              <button className="hover:text-white mr-3 underline">Professional Services</button>
              <button className="hover:text-white underline">Faith Apparel</button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6">
            <div className="text-2xl md:text-3xl font-bold text-white">500+</div>
            <div className="text-blue-100 text-sm md:text-base">Products</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6">
            <div className="text-2xl md:text-3xl font-bold text-white">100+</div>
            <div className="text-blue-100 text-sm md:text-base">Vendors</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6">
            <div className="text-2xl md:text-3xl font-bold text-white">1000+</div>
            <div className="text-blue-100 text-sm md:text-base">Happy Customers</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6">
            <div className="text-2xl md:text-3xl font-bold text-white">4.9★</div>
            <div className="text-blue-100 text-sm md:text-base">Average Rating</div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-12 md:h-20">
          <path
            fill="#ffffff"
            d="M0,120 C240,60 480,0 720,40 C960,80 1200,120 1440,60 L1440,120 L0,120 Z"
          />
        </svg>
      </div>
    </section>
  )
}