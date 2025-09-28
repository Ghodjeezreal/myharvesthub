const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const sampleReviews = [
  {
    rating: 5,
    comment: "Absolutely love this product! High quality and exactly as described. Will definitely purchase again!",
    status: 'APPROVED',
    isVerified: true
  },
  {
    rating: 4,
    comment: "Great product overall. Good value for money. Shipping was fast and packaging was secure.",
    status: 'APPROVED',
    isVerified: true
  },
  {
    rating: 5,
    comment: "Exceeded my expectations! Beautiful craftsmanship and attention to detail. Highly recommend!",
    status: 'APPROVED',
    isVerified: false
  },
  {
    rating: 3,
    comment: "Product is okay, but not exactly what I expected. Quality is decent for the price.",
    status: 'APPROVED',
    isVerified: true
  },
  {
    rating: 5,
    comment: "Amazing! Perfect for what I needed. The vendor was very responsive and helpful.",
    status: 'APPROVED',
    isVerified: true
  },
  {
    rating: 4,
    comment: "Good product, arrived quickly. Would buy from this vendor again.",
    status: 'PENDING',
    isVerified: false
  },
  {
    rating: 2,
    comment: "Not satisfied with the quality. Expected better based on the description.",
    status: 'PENDING',
    isVerified: true
  }
]

async function seedReviews() {
  try {
    console.log('🌱 Starting to seed reviews...')

    // Get all products and users
    const products = await prisma.product.findMany({ take: 20 })
    const customers = await prisma.user.findMany({ 
      where: { role: 'CUSTOMER' },
      take: 10
    })

    if (products.length === 0 || customers.length === 0) {
      console.log('❌ No products or customers found. Please seed products and users first.')
      return
    }

    console.log(`📦 Found ${products.length} products and ${customers.length} customers`)

    // Create reviews for random products
    let reviewsCreated = 0
    
    for (let i = 0; i < 30; i++) {
      const randomProduct = products[Math.floor(Math.random() * products.length)]
      const randomCustomer = customers[Math.floor(Math.random() * customers.length)]
      const randomReview = sampleReviews[Math.floor(Math.random() * sampleReviews.length)]

      // Check if this customer has already reviewed this product
      const existingReview = await prisma.review.findFirst({
        where: {
          userId: randomCustomer.id,
          productId: randomProduct.id
        }
      })

      if (!existingReview) {
        await prisma.review.create({
          data: {
            userId: randomCustomer.id,
            productId: randomProduct.id,
            rating: randomReview.rating,
            comment: randomReview.comment,
            status: randomReview.status,
            isVerified: randomReview.isVerified
          }
        })
        reviewsCreated++
      }
    }

    console.log(`✅ Created ${reviewsCreated} sample reviews`)

    // Show some stats
    const totalReviews = await prisma.review.count()
    const approvedReviews = await prisma.review.count({
      where: { status: 'APPROVED' }
    })
    const pendingReviews = await prisma.review.count({
      where: { status: 'PENDING' }
    })

    console.log(`📊 Review Statistics:`)
    console.log(`   Total Reviews: ${totalReviews}`)
    console.log(`   Approved: ${approvedReviews}`)
    console.log(`   Pending: ${pendingReviews}`)

  } catch (error) {
    console.error('❌ Error seeding reviews:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedReviews()