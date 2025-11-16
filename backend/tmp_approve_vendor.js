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

    const vendor = await prisma.vendorProfile.findUnique({ where: { userId: user.id }, select: { id: true, verificationStatus: true } });
    if (!vendor) {
      console.log('Vendor profile not found for user:', user.id);
      process.exit(0);
    }

    const updated = await prisma.vendorProfile.update({
      where: { id: vendor.id },
      data: { verificationStatus: 'VERIFIED' }
    });

    // Ensure user is active
    await prisma.user.update({ where: { id: user.id }, data: { isActive: true } });

    console.log(JSON.stringify({ approved: true, vendorId: vendor.id, previousStatus: vendor.verificationStatus, newStatus: updated.verificationStatus }, null, 2));
    await prisma.$disconnect();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
