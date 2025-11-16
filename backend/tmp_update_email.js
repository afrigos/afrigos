(async () => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const oldEmail = 'oreoluwa@gmail.com';
    const newEmail = 'alphaxio47@gmail.com';

    const existingNew = await prisma.user.findUnique({ where: { email: newEmail.toLowerCase() } });
    if (existingNew) {
      console.log(JSON.stringify({ updated: false, reason: 'new_email_already_exists', userId: existingNew.id }, null, 2));
      await prisma.$disconnect();
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: oldEmail.toLowerCase() } });
    if (!user) {
      console.log(JSON.stringify({ updated: false, reason: 'old_email_not_found' }, null, 2));
      await prisma.$disconnect();
      return;
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { email: newEmail.toLowerCase() }
    });

    console.log(JSON.stringify({ updated: true, userId: updated.id, oldEmail, newEmail }, null, 2));
    await prisma.$disconnect();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
