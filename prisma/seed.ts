import { PrismaClient, UserRole, VendorStatus, ProductStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create categories
  const categories = [
    {
      name: 'Handmade Crafts',
      slug: 'handmade-crafts',
      description: 'Unique, handcrafted items made with love',
    },
    {
      name: 'Baked Goods',
      slug: 'baked-goods',
      description: 'Fresh, homemade treats and specialties',
    },
    {
      name: 'Professional Services',
      slug: 'professional-services',
      description: 'Expert services from trusted members',
    },
    {
      name: 'Faith-Based Apparel',
      slug: 'faith-based-apparel',
      description: 'Clothing that expresses your faith',
    },
    {
      name: 'Home & Garden',
      slug: 'home-garden',
      description: 'Beautiful items for your home and garden',
    },
    {
      name: 'Books & Media',
      slug: 'books-media',
      description: 'Christian books, music, and educational materials',
    }
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
  }

  // Create a demo admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@myharvesthub.com' },
    update: {},
    create: {
      email: 'admin@myharvesthub.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      password: adminPassword,
      churchName: 'My Harvest Hub Church',
      churchRole: 'Administrator',
      isVerified: true,
    },
  })

  // Create a demo vendor user
  const vendorPassword = await bcrypt.hash('vendor123', 12)
  const vendor = await prisma.user.upsert({
    where: { email: 'vendor@myharvesthub.com' },
    update: {},
    create: {
      email: 'vendor@myharvesthub.com',
      name: 'Sarah Johnson',
      role: UserRole.VENDOR,
      password: vendorPassword,
      churchName: 'Grace Community Church',
      churchRole: 'Member',
      isVerified: true,
    },
  })

  // Create vendor profile
  const craftsCategory = await prisma.category.findFirst({
    where: { slug: 'handmade-crafts' }
  })

  if (craftsCategory) {
    const vendorProfile = await prisma.vendor.upsert({
      where: { userId: vendor.id },
      update: {},
      create: {
        userId: vendor.id,
        businessName: "Sarah's Handmade Treasures",
        businessType: 'Handmade Crafts',
        description: 'Beautiful handmade crafts created with love and faith. Each piece is unique and made with the highest quality materials.',
        businessPhone: '(555) 123-4567',
        businessEmail: 'sarah@handmadetreasures.com',
        website: 'https://sarahshandmadetreasures.com',
        churchAffiliation: 'Grace Community Church',
        faithStatement: 'I believe God has given me a gift for creating beautiful things, and I want to use this talent to serve my community and glorify Him.',
        status: VendorStatus.APPROVED,
        isActive: true,
        averageRating: 4.8,
        totalSales: 1250.00,
        totalOrders: 25,
      },
    })

    // Add vendor to category
    await prisma.vendorCategory.upsert({
      where: {
        vendorId_categoryId: {
          vendorId: vendorProfile.id,
          categoryId: craftsCategory.id,
        }
      },
      update: {},
      create: {
        vendorId: vendorProfile.id,
        categoryId: craftsCategory.id,
      },
    })

    // Create sample products
    const products = [
      {
        name: 'Handwoven Prayer Shawl',
        slug: 'handwoven-prayer-shawl',
        description: 'A beautiful, soft prayer shawl handwoven with love and prayers. Perfect for comfort during difficult times or as a meaningful gift.',
        shortDesc: 'Soft, handwoven prayer shawl made with love',
        price: 75.00,
        comparePrice: 95.00,
        status: ProductStatus.ACTIVE,
        stockQuantity: 10,
        tags: 'prayer,shawl,comfort,handmade,spiritual',
        sku: 'PRS001',
      },
      {
        name: 'Inspirational Wall Cross',
        slug: 'inspirational-wall-cross',
        description: 'Handcrafted wooden cross with inspirational scripture verse. Made from reclaimed barn wood for a rustic, meaningful touch.',
        shortDesc: 'Handcrafted wooden cross with scripture',
        price: 45.00,
        status: ProductStatus.ACTIVE,
        stockQuantity: 15,
        tags: 'cross,wood,scripture,wall art,inspirational',
        sku: 'IWC001',
      },
      {
        name: 'Faith-Based Journal Set',
        slug: 'faith-based-journal-set',
        description: 'Set of three beautiful journals with faith-inspired covers. Perfect for daily devotions, prayer requests, and gratitude journaling.',
        shortDesc: 'Set of 3 faith-inspired journals',
        price: 32.00,
        status: ProductStatus.ACTIVE,
        stockQuantity: 20,
        tags: 'journal,devotion,prayer,writing,faith',
        sku: 'FBJ001',
      }
    ]

    for (const product of products) {
      const createdProduct = await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: {
          ...product,
          vendorId: vendorProfile.id,
          categoryId: craftsCategory.id,
        },
      })

      // Add placeholder images for each product (delete existing first)
      await prisma.productImage.deleteMany({
        where: { productId: createdProduct.id }
      })

      // Add primary image
      await prisma.productImage.create({
        data: {
          productId: createdProduct.id,
          url: `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`,
          alt: `${product.name} - Main Image`,
          isPrimary: true,
          order: 1,
        },
      })

      // Add a second image
      await prisma.productImage.create({
        data: {
          productId: createdProduct.id,
          url: `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`,
          alt: `${product.name} - Additional View`,
          isPrimary: false,
          order: 2,
        },
      })
    }
  }

  // Create a demo customer
  const customerPassword = await bcrypt.hash('customer123', 12)
  const customer = await prisma.user.upsert({
    where: { email: 'customer@myharvesthub.com' },
    update: {},
    create: {
      email: 'customer@myharvesthub.com',
      name: 'John Smith',
      role: UserRole.CUSTOMER,
      password: customerPassword,
      churchName: 'Hope Fellowship',
      churchRole: 'Member',
      isVerified: true,
    },
  })

  console.log('Database seeded successfully!')
  console.log('\nDemo accounts created:')
  console.log('Admin: admin@myharvesthub.com / admin123')
  console.log('Vendor: vendor@myharvesthub.com / vendor123')  
  console.log('Customer: customer@myharvesthub.com / customer123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })