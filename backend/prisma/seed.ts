import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.role.createMany({
    data: [
      { name: 'ADMIN' },
      { name: 'MANAGER' },
      { name: 'EDITOR' },
      { name: 'CUSTOMER' },
    ],
    skipDuplicates: true,
  });

  await prisma.setting.createMany({
    data: [
      { key: 'shop_name', value: 'GhostMarket' },
      { key: 'phone', value: '+33 1 23 45 67 89' },
      { key: 'email', value: 'info@example.com' },
      { key: 'address', value: 'Paris' },
    ],
    skipDuplicates: true,
  });

  console.log('Seed exécuté avec succès');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
