const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    console.log('📋 Current users in database:')
    if (users.length === 0) {
      console.log('   No users found.')
    } else {
      users.forEach(user => {
        console.log(`   ${user.name} (${user.email}) - Role: ${user.role}`)
      })
    }

    const adminCount = users.filter(u => u.role === 'ADMIN').length
    console.log(`\n👑 Admin users: ${adminCount}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()