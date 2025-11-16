(async () => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const email = 'adegboye.izik@gmail.com';

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });
    if (!user) {
      console.log('User not found for email:', email);
      process.exit(0);
    }

    const updated = await prisma.user.update({ where: { id: user.id }, data: { role: 'VENDOR' } });
    console.log(JSON.stringify({ updated: true, userId: user.id, previousRole: user.role, newRole: updated.role }, null, 2));
    await prisma.$disconnect();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
