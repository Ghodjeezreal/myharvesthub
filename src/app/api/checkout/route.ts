import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db as prisma } from '@/lib/db'

interface CheckoutItem {
  productId: string
  quantity: number
  price: number
  vendorId: string
}

interface ShippingAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface CheckoutTotals {
  subtotal: number
  tax: number
  shipping: number
  total: number
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { items, shippingAddress, totals }: {
      items: CheckoutItem[]
      shippingAddress: ShippingAddress
      totals: CheckoutTotals
    } = body

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart items are required' },
        { status: 400 }
      )
    }

    if (!shippingAddress || !totals) {
      return NextResponse.json(
        { error: 'Shipping address and totals are required' },
        { status: 400 }
      )
    }

    // Verify products exist and have sufficient stock
    const productIds = items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: 'ACTIVE'
      },
      include: {
        vendor: true,
        images: true
      }
    })

    if (products.length !== items.length) {
      return NextResponse.json(
        { error: 'Some products are no longer available' },
        { status: 400 }
      )
    }

    // Verify stock quantities
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product || product.stockQuantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product?.name || 'product'}` },
          { status: 400 }
        )
      }
    }

    // Create shipping address first
    const shippingAddressRecord = await prisma.shippingAddress.create({
      data: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country,
      }
    })

    // Create pending order record
    const orderNumber = `MHH-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
    
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: session.user.id,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: totals.shipping,
        total: totals.total,
        shippingAddressId: shippingAddressRecord.id,
        items: {
          create: items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!
            return {
              productId: item.productId,
              vendorId: product.vendorId,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity,
              productName: product.name,
              productImage: product.images.length > 0 ? product.images[0].url : null,
            }
          })
        },
      }
    })

    // Return order details for Paystack initialization
    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: Math.round(totals.total * 100), // Paystack amount in kobo (cents)
      email: shippingAddress.email,
      customerName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
      phone: shippingAddress.phone,
      reference: `${orderNumber}-${Date.now()}`,
    })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}