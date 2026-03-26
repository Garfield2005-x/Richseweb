import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      password: true 
    }
  });
  console.log('Total users:', users.length);
  users.forEach(u => {
    console.log(`- ${u.email} (Role: ${u.role}) - Has Password: ${!!u.password}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
