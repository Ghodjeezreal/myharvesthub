'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Heart, 
  User, 
  ShoppingCart, 
  Menu, 
  X,
  ChevronDown,
  Package,
  Settings,
  LogOut,
  Store
} from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

export function MainHeader() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { data: session } = useSession()
  const { getItemCount } = useCart()
  const router = useRouter()

  const cartItemCount = getItemCount()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const categories = [
    { name: 'Home', href: '/' },
    { name: 'Baby Products', href: '/marketplace?category=baby-products' },
    { name: 'Beauty & Personal Care', href: '/marketplace?category=beauty-personal-care' },
    { name: 'Electronics', href: '/marketplace?category=electronics' },
    { name: 'More', href: '/marketplace' }
  ]

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
    setIsUserMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      {/* Top row with logo, navigation, and user actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile hamburger menu */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="flex items-center">
                <span className="text-gray-600 text-xl md:text-2xl font-medium">My</span>
                <span className="text-gray-900 text-xl md:text-2xl font-bold">Harvest</span>
                <span className="text-purple-600 text-xl md:text-2xl font-medium">Hub</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="text-gray-700 hover:text-purple-600 font-medium flex items-center gap-1"
              >
                {category.name}
                {category.name === 'More' && <ChevronDown className="w-4 h-4" />}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Wishlist */}
            <Button variant="ghost" size="sm" className="relative p-2">
              <Heart className="w-5 h-5" />
              <span className="sr-only">Wishlist</span>
            </Button>

            {/* User Account */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 p-2"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <User className="w-5 h-5" />
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-xs text-gray-500">
                    {session ? 'Account' : 'Sign In'}
                  </span>
                  <span className="text-sm font-medium">
                    {session?.user?.name || 'Account'}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                  {session ? (
                    <>
                      <div className="px-4 py-2 border-b">
                        <p className="font-medium text-sm">{session.user?.name}</p>
                        <p className="text-xs text-gray-500">{session.user?.email}</p>
                      </div>
                      
                      {session.user?.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          <Settings className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      
                      {session.user?.role === 'VENDOR' && (
                        <Link
                          href="/vendor/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          <Store className="w-4 h-4" />
                          Vendor Dashboard
                        </Link>
                      )}
                      
                      <Link
                        href="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        <Package className="w-4 h-4" />
                        My Orders
                      </Link>
                      
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/signin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/register"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Cart */}
            <Button variant="ghost" size="sm" className="relative p-2">
              <Link href="/cart" className="flex items-center">
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[18px] h-5 flex items-center justify-center rounded-full">
                    {cartItemCount}
                  </Badge>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Second row with full-width search bar */}
      <div className=" bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <form onSubmit={handleSearch} className="relative max-w-4xl mx-auto">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search everything at MyHarvest online and in store..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-3 text-base border-2 border-gray-200 focus:border-purple-400 bg-white"
              />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed top-0 left-0 w-80 h-full bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <nav className="p-4">
              <div className="space-y-4">
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-3 px-4 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg font-medium"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
              
              <div className="mt-8 pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Account</h3>
                {session ? (
                  <div className="space-y-2">
                    <div className="px-4 py-2">
                      <p className="font-medium text-sm">{session.user?.name}</p>
                      <p className="text-xs text-gray-500">{session.user?.email}</p>
                    </div>
                    
                    {session.user?.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 py-2 px-4 text-sm hover:bg-gray-50 rounded"
                      >
                        <Settings className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}
                    
                    {session.user?.role === 'VENDOR' && (
                      <Link
                        href="/vendor/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 py-2 px-4 text-sm hover:bg-gray-50 rounded"
                      >
                        <Store className="w-4 h-4" />
                        Vendor Dashboard
                      </Link>
                    )}
                    
                    <Link
                      href="/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 py-2 px-4 text-sm hover:bg-gray-50 rounded"
                    >
                      <Package className="w-4 h-4" />
                      My Orders
                    </Link>
                    
                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex items-center gap-2 py-2 px-4 text-sm hover:bg-gray-50 rounded w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/auth/signin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-2 px-4 text-sm hover:bg-gray-50 rounded"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-2 px-4 text-sm hover:bg-gray-50 rounded"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  )
}