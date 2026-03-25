
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const subscribers = await prisma.subscriber.findMany()
  console.log('Total subscribers:', subscribers.length)
  subscribers.forEach(s => {
    console.log(`- ${s.email} (Created: ${s.createdAt})`)
  })
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
