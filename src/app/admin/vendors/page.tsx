'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AdminHeader } from '@/components/AdminHeader'

interface Vendor {
  id: string
  businessName: string
  businessDescription: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  user: {
    name: string
    email: string
  }
  products?: {
    length: number
  }
}

export default function AdminVendorsPage() {
  const { data: session, status } = useSession()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
      return
    }
    if (!session || session.user.role !== 'ADMIN') {
      redirect('/')
      return
    }
    fetchVendors()
  }, [session, status])

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/admin/vendors')
      if (response.ok) {
        const data = await response.json()
        setVendors(data.vendors)
      }
    } catch (error) {
      console.error('Error fetching vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateVendorStatus = async (vendorId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        setVendors(vendors.map(vendor => 
          vendor.id === vendorId ? { ...vendor, status } : vendor
        ))
      }
    } catch (error) {
      console.error('Error updating vendor status:', error)
    }
  }

  const filteredVendors = vendors.filter(vendor => 
    selectedStatus === 'ALL' || vendor.status === selectedStatus
  )

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

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <AdminHeader />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
          
          <div className="flex gap-2">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
              <Button
                key={status}
                variant={selectedStatus === status ? 'default' : 'outline'}
                onClick={() => setSelectedStatus(status)}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          {filteredVendors.map(vendor => (
            <Card key={vendor.id} className="p-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold">
                  {vendor.businessName}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    vendor.status === 'APPROVED' ? 'default' :
                    vendor.status === 'REJECTED' ? 'destructive' : 'outline'
                  }>
                    {vendor.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700">Contact Information</h4>
                    <p className="text-sm text-gray-600">{vendor.user.name}</p>
                    <p className="text-sm text-gray-600">{vendor.user.email}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700">Application Date</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(vendor.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Business Description</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {vendor.businessDescription}
                  </p>
                </div>

                {vendor.status === 'APPROVED' && vendor.products && (
                  <div>
                    <h4 className="font-semibold text-gray-700">Products Listed</h4>
                    <p className="text-sm text-gray-600">{vendor.products.length} products</p>
                  </div>
                )}

                {vendor.status === 'PENDING' && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => updateVendorStatus(vendor.id, 'APPROVED')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => updateVendorStatus(vendor.id, 'REJECTED')}
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                    >
                      Reject
                    </Button>
                  </div>
                )}

                {vendor.status !== 'PENDING' && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => updateVendorStatus(vendor.id, 'APPROVED')}
                      variant={vendor.status === 'APPROVED' ? 'default' : 'outline'}
                    >
                      {vendor.status === 'APPROVED' ? 'Approved ✓' : 'Approve'}
                    </Button>
                    <Button
                      onClick={() => updateVendorStatus(vendor.id, 'REJECTED')}
                      variant={vendor.status === 'REJECTED' ? 'outline' : 'outline'}
                      className={vendor.status === 'REJECTED' ? 'border-red-500 text-red-500' : ''}
                    >
                      {vendor.status === 'REJECTED' ? 'Rejected' : 'Reject'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {filteredVendors.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No vendors found for the selected status.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}