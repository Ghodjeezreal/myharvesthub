import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
                      .update(body)
                      .digest('hex')
    
    const signature = request.headers.get('x-paystack-signature')
    
    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)

    if (event.event === 'charge.success') {
      const reference = event.data.reference
      const status = event.data.status
      const amount = event.data.amount // Amount in kobo

      if (status === 'success') {
        // Find the order by reference
        const orderNumber = reference.split('-')[0] + '-' + reference.split('-')[1] + '-' + reference.split('-')[2]
        
        const order = await prisma.order.findFirst({
          where: {
            orderNumber: orderNumber
          },
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        })

        if (order && order.paymentStatus === 'PENDING') {
          // Update order status
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'CONFIRMED',
              paymentStatus: 'PAID',
              paymentReference: reference,
              updatedAt: new Date()
            }
          })

          // Update stock quantities
          for (const orderItem of order.items) {
            await prisma.product.update({
              where: { id: orderItem.productId },
              data: {
                stockQuantity: {
                  decrement: orderItem.quantity
                },
                sales: {
                  increment: orderItem.quantity
                }
              }
            })
          }

          // Create vendor payouts
          const vendorPayouts = new Map()
          
          for (const orderItem of order.items) {
            const vendorId = orderItem.vendorId
            const itemTotal = orderItem.total
            const commission = itemTotal * 0.05 // 5% commission
            const payout = itemTotal - commission

            if (vendorPayouts.has(vendorId)) {
              vendorPayouts.set(vendorId, vendorPayouts.get(vendorId) + payout)
            } else {
              vendorPayouts.set(vendorId, payout)
            }
          }

          // Create payout records
          for (const [vendorId, amount] of vendorPayouts) {
            await prisma.vendorPayout.create({
              data: {
                vendorId,
                orderId: order.id,
                amount,
                status: 'PENDING',
                payoutDate: null
              }
            })
          }

          console.log(`Order ${order.orderNumber} payment confirmed via Paystack`)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Paystack webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}