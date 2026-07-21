import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@demo.com';
  const password = hashSync('demo12345', 8);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Admin Demo',
      password,
      role: 'ADMIN',
    },
  });

  console.log(`Seeded admin user: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
