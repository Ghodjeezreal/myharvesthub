const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Check if there are any admin users
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists:')
      console.log(`   Name: ${existingAdmin.name}`)
      console.log(`   Email: ${existingAdmin.email}`)
      console.log(`   Role: ${existingAdmin.role}`)
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@harvesthub.com',
        password: hashedPassword,
        role: 'ADMIN',
        churchName: 'Harvest Hub Admin',
        isVerified: true
      }
    })

    console.log('✅ Created new admin user:')
    console.log(`   Name: ${adminUser.name}`)
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Password: admin123`)
    console.log(`   Role: ${adminUser.role}`)
    console.log('')
    console.log('🔑 You can now sign in with these credentials to access the admin dashboard!')

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()