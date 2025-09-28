'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AdminHeader } from '@/components/AdminHeader'

interface Order {
  id: string
  customerName: string
  customerEmail: string
  total: number
  status: string
  itemCount: number
  createdAt: string
}

export default function AdminOrdersPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

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
    fetchOrders()
  }, [session, status])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        </div>

        <div className="grid gap-6">
          {orders.map(order => (
            <Card key={order.id} className="p-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold">
                  Order #{order.id.slice(-6)}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    order.status === 'COMPLETED' ? 'default' :
                    order.status === 'CANCELLED' ? 'destructive' : 'outline'
                  }>
                    {order.status}
                  </Badge>
                  <span className="text-lg font-bold text-green-600">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700">Customer</h4>
                    <p className="text-sm text-gray-600">{order.customerName}</p>
                    <p className="text-sm text-gray-600">{order.customerEmail}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700">Order Details</h4>
                    <p className="text-sm text-gray-600">{order.itemCount} items</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700">Total Amount</h4>
                    <p className="text-lg font-bold text-green-600">
                      ${order.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {orders.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No orders found.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}